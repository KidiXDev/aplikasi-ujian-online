'use client';

import { InitialConfigType, LexicalComposer } from '@lexical/react/LexicalComposer';
import { ChangeEvent, useEffect, useState } from 'react';

import { ListItemNode, ListNode } from '@lexical/list';
import { OverflowNode } from '@lexical/overflow';
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { $createRangeSelection, $setSelection, ParagraphNode, TextNode } from 'lexical';

import { ContentEditable } from '@/components/editor/editor-ui/content-editable';
import { ImageNode } from '@/components/editor/nodes/image-node';
import { CheckListPlugin } from '@lexical/react/LexicalCheckListPlugin';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';

import { BlockFormatDropDown } from '@/components/editor/plugins/toolbar/block-format-toolbar-plugin';
import { FormatBulletedList } from '@/components/editor/plugins/toolbar/block-format/format-bulleted-list';
import { FormatCheckList } from '@/components/editor/plugins/toolbar/block-format/format-check-list';
import { FormatHeading } from '@/components/editor/plugins/toolbar/block-format/format-heading';
import { FormatNumberedList } from '@/components/editor/plugins/toolbar/block-format/format-numbered-list';
import { FormatParagraph } from '@/components/editor/plugins/toolbar/block-format/format-paragraph';
import { FormatQuote } from '@/components/editor/plugins/toolbar/block-format/format-quote';
import { HistoryToolbarPlugin } from '@/components/editor/plugins/toolbar/history-toolbar-plugin';
import { ToolbarPlugin } from '@/components/editor/plugins/toolbar/toolbar-plugin';

import { ClearFormattingToolbarPlugin } from '@/components/editor/plugins/toolbar/clear-formatting-toolbar-plugin';
import { ElementFormatToolbarPlugin } from '@/components/editor/plugins/toolbar/element-format-toolbar-plugin';
import { FontBackgroundToolbarPlugin } from '@/components/editor/plugins/toolbar/font-background-toolbar-plugin';
import { FontColorToolbarPlugin } from '@/components/editor/plugins/toolbar/font-color-toolbar-plugin';
import { FontFamilyToolbarPlugin } from '@/components/editor/plugins/toolbar/font-family-toolbar-plugin';
import { FontFormatToolbarPlugin } from '@/components/editor/plugins/toolbar/font-format-toolbar-plugin';
import { FontSizeToolbarPlugin } from '@/components/editor/plugins/toolbar/font-size-toolbar-plugin';
import { LinkToolbarPlugin } from '@/components/editor/plugins/toolbar/link-toolbar-plugin';
import { SubSuperToolbarPlugin } from '@/components/editor/plugins/toolbar/subsuper-toolbar-plugin';

import { ActionsPlugin } from '@/components/editor/plugins/actions/actions-plugin';
import { CharacterLimitPlugin } from '@/components/editor/plugins/actions/character-limit-plugin';
import { ClearEditorActionPlugin } from '@/components/editor/plugins/actions/clear-editor-plugin';
import { CounterCharacterPlugin } from '@/components/editor/plugins/actions/counter-character-plugin';
import { EditModeTogglePlugin } from '@/components/editor/plugins/actions/edit-mode-toggle-plugin';
import { MaxLengthPlugin } from '@/components/editor/plugins/actions/max-length-plugin';
import { ImagesPlugin } from '@/components/editor/plugins/images-plugin';
import { ClearEditorPlugin } from '@lexical/react/LexicalClearEditorPlugin';

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { $createParagraphNode, $createTextNode, $getRoot, EditorState } from 'lexical';

const placeholder = 'Start typing...';

const editorConfig: InitialConfigType = {
    namespace: 'Editor',
    theme: {
        // optional, bisa sesuaikan tema kamu
    },
    nodes: [HeadingNode, ParagraphNode, TextNode, QuoteNode, ListNode, ListItemNode, ImageNode, OverflowNode],
    onError: (error: Error) => {
        console.error(error);
    },
};

// Moved from BankSoalCreate - Convert file to base64
const convertToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (error) => reject(error);
    });

// Moved from BankSoalCreate - Image Upload component
const ImageUpload = ({
    onUpload,
    uploaded,
}: {
    onUpload: (base64: string) => void;
    uploaded: boolean;
    onClear?: () => void;
    previewSrc?: string;
}) => {
    const handleImageChange = async (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            try {
                const base64 = await convertToBase64(file);
                onUpload(base64);
            } catch (err) {
                console.error('Gagal mengonversi gambar ke Base64:', err);
            }
        }
    };

    return (
        <div className="space-y-2">
            <div className="relative inline-block">
                <label
                    className={`flex h-8 w-20 cursor-pointer items-center justify-center rounded-lg border-2 text-sm transition-all ${
                        uploaded ? 'border-green-500 bg-green-50 text-green-700' : 'border-gray-300 bg-white text-gray-500 hover:bg-gray-50'
                    }`}
                >
                    {uploaded ? 'Change' : 'Images'}
                    <input type="file" accept="image/*" className="absolute inset-0 cursor-pointer opacity-0" onChange={handleImageChange} />
                </label>
            </div>
        </div>
    );
};

function LoadInitialContent({ value }: { value?: string }) {
    const [editor] = useLexicalComposerContext();
    const [hasLoaded, setHasLoaded] = useState(false);

    useEffect(() => {
        if (value && !hasLoaded) {
            setHasLoaded(true);
            editor.update(() => {
                const root = $getRoot();
                root.clear(); // Kosongkan root terlebih dahulu

                // Pastikan nilai yang dimasukkan tidak kosong atau hanya whitespace
                const cleanedValue = value.trim();

                if (cleanedValue) {
                    const paragraph = $createParagraphNode();
                    const textNode = $createTextNode(cleanedValue);
                    paragraph.append(textNode);
                    root.append(paragraph);

                    const selection = $createRangeSelection();
                    selection.anchor.set(textNode.getKey(), cleanedValue.length, 'text');
                    selection.focus.set(textNode.getKey(), cleanedValue.length, 'text');
                    $setSelection(selection);
                }
            });
        }
    }, [editor, value, hasLoaded]);

    return null;
}

type EditorProps = {
    value?: string;
    onChange?: (value: string) => void;
};

export default function Editor({ value, onChange }: EditorProps) {
    const [, setFloatingAnchorElem] = useState<HTMLDivElement | null>(null);
    const [hasInitialized, setHasInitialized] = useState(false);
    // Added for image upload functionality
    const [imageBase64, setImageBase64] = useState<string | null>(null);
    const [imageUploaded, setImageUploaded] = useState<boolean>(false);
    const [showEditor, setShowEditor] = useState<boolean>(true);

    const onRef = (_floatingAnchorElem: HTMLDivElement) => {
        if (_floatingAnchorElem !== null) {
            setFloatingAnchorElem(_floatingAnchorElem);
        }
    };

    const handleChange = (editorState: EditorState) => {
        editorState.read(() => {
            const root = $getRoot();
            const text = root.getTextContent();
            if (!hasInitialized) {
                setHasInitialized(true);
                return;
            }

            if (onChange && !imageBase64) {
                onChange(text);
            }
        });
    };

    // Handle image upload
    const handleImageUpload = (base64: string) => {
        setImageBase64(base64);
        setImageUploaded(true);
        setShowEditor(false);

        // Pass the base64 image to parent component
        if (onChange) {
            const base64Only = base64.split(',')[1] || base64;
            onChange(base64Only);
        }
    };

    // Handle image clear
    const handleImageClear = () => {
        setImageBase64(null);
        setImageUploaded(false);
        setShowEditor(true);

        if (onChange) {
            onChange('');
        }
    };

    return (
        <LexicalComposer initialConfig={editorConfig}>
            <ToolbarPlugin>
                {() => (
                    <div className="dark:bg-background relative z-10 border-b bg-white">
                        <div className="flex gap-2 overflow-auto p-1">
                            <HistoryToolbarPlugin />
                            <BlockFormatDropDown>
                                <FormatParagraph />
                                <FormatHeading levels={['h1', 'h2', 'h3']} />
                                <FormatNumberedList />
                                <FormatBulletedList />
                                <FormatCheckList />
                                <FormatQuote />
                            </BlockFormatDropDown>
                            <FontFamilyToolbarPlugin />
                            <FontSizeToolbarPlugin />
                            <FontFormatToolbarPlugin format="bold" />
                            <FontFormatToolbarPlugin format="italic" />
                            <FontFormatToolbarPlugin format="underline" />
                            <FontFormatToolbarPlugin format="strikethrough" />
                            <SubSuperToolbarPlugin />
                            <LinkToolbarPlugin />
                            <ClearFormattingToolbarPlugin />
                            <FontColorToolbarPlugin />
                            <FontBackgroundToolbarPlugin />
                            {/* Added image upload button */}
                            <ImageUpload
                                uploaded={imageUploaded}
                                previewSrc={imageBase64 || undefined}
                                onUpload={handleImageUpload}
                                onClear={handleImageClear}
                            />
                        </div>
                        <div className="flex gap-2 overflow-auto p-1">
                            <ElementFormatToolbarPlugin />
                        </div>
                    </div>
                )}
            </ToolbarPlugin>

            <div className="relative">
                {showEditor ? (
                    <>
                        <RichTextPlugin
                            contentEditable={
                                <div className="" ref={onRef}>
                                    <ContentEditable
                                        placeholder={placeholder}
                                        className="ContentEditable__root relative block h-72 min-h-72 overflow-auto px-8 py-4 focus:outline-none"
                                    />
                                </div>
                            }
                            ErrorBoundary={LexicalErrorBoundary}
                        />
                        <OnChangePlugin onChange={handleChange} />
                        <LoadInitialContent value={value} />
                    </>
                ) : (
                    <div className="relative flex h-72 min-h-72 items-center justify-center rounded-lg border bg-gray-50 p-2">
                        <img src={imageBase64 || ''} alt="Preview Gambar" className="mx-auto max-h-60 max-w-full" />
                        <button
                            type="button"
                            onClick={handleImageClear}
                            className="absolute top-2 right-2 rounded-full border border-gray-300 bg-white px-2 text-xs text-red-500 hover:bg-red-50"
                        >
                            ✕
                        </button>
                    </div>
                )}
                <ListPlugin />
                <CheckListPlugin />
                <HistoryPlugin />
                <ImagesPlugin />
                <ActionsPlugin>
                    <div className="clear-both flex items-center justify-between gap-2 overflow-auto border-t p-1">
                        <div className="flex flex-1 justify-start">
                            <MaxLengthPlugin maxLength={10000} />
                            <CharacterLimitPlugin maxLength={10000} charset="UTF-16" />
                        </div>
                        <div>
                            <CounterCharacterPlugin charset="UTF-16" />
                        </div>
                        <div className="flex flex-1 justify-end">
                            <EditModeTogglePlugin />
                            <ClearEditorActionPlugin />
                            <ClearEditorPlugin />
                        </div>
                    </div>
                </ActionsPlugin>
            </div>
        </LexicalComposer>
    );
}
