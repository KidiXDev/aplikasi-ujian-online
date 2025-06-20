import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from './ui/alert-dialog';

export function CAlertDialog(props: {
    open: boolean;
    setOpen: (open: boolean) => void;
    onContinue: () => void;
    onCancel?: () => void;
    title?: string;
    description?: string;
}) {
    return (
        <AlertDialog open={props.open} onOpenChange={props.setOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{props.title || 'Are you sure?'}</AlertDialogTitle>
                    <AlertDialogDescription>
                        {props.description ||
                            'This action cannot be undone. This will permanently delete the selected user and remove the data from our servers.'}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogAction
                        className="bg-button-primary cursor-pointer shadow transition-colors hover:bg-[#475873] hover:text-white"
                        onClick={props.onContinue}
                    >
                        Iya
                    </AlertDialogAction>
                    <AlertDialogCancel
                        className="bg-button-danger cursor-pointer text-white shadow transition-colors hover:bg-[#720508] hover:text-white"
                        onClick={props.onCancel}
                    >
                        Tidak
                    </AlertDialogCancel>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
