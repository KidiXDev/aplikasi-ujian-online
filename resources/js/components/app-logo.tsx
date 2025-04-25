import AppLogoIcon from './app-logo-icon';

export default function AppLogo() {
    return (
        <>
            <div className="text-sidebar-primary-foreground flex aspect-square size-9 items-center justify-center rounded-md">
                <AppLogoIcon className="items-center" />
            </div>
            <div className="ml-1 flex items-center text-left text-2xl font-semibold">
                <span className="truncate">UJIAN</span>
            </div>
        </>
    );
}
