"use client";

export function FooterHub(){
    const currentYear = new Date().getFullYear();
    return(
        <div className="w-full py-6 border-t text-center">
            <p className="text-xs text-muted-foreground tracking-wide">
                &copy; {currentYear} Apriantoz
            </p>
        </div>
    );
}