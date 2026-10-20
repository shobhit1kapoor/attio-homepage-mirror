// Runs while <head> parses, so a signed-in visitor never sees the signed-out
// header CTAs. app.attio.com sets attio-session-id on .attio.com and clears it
// at sign-out. It is only a UI hint, never an auth check.
if (/(?:^|; )attio-session-id=/.test(document.cookie)) {
    document.documentElement.classList.add("signed-in")
}
