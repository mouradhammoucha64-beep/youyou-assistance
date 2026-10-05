# YOUYOU SEO V11

Changes from V10:
- Persistent purple selected SEO tab, pressed state for assistive technology, improved chip contrast and compact cards.
- Shared title and description across the SEO pack, Google preview and copy actions.
- Clear setup-gap wording, sample-data warning and local profile completeness details.
- Content ideas select their own outline; Copy content brief follows the selected idea.
- HTML-only audit explicitly reports suspected JavaScript app shells as partial/unverified. It suppresses unsupported missing-heading, thin-content and internal-link claims for those shells.
- Duplicate-title findings no longer recommend reusing the duplicate title. Secondary pages no longer inherit homepage service keyword targets or generic replacement metadata.
- Empty alt attributes on decorative images are accepted. Main HTML declares English.
- Clipboard failures display feedback.

Validation: production build succeeded; 37 existing/initial tests passed, followed by all 4 focused V11 tests including shared metadata. No authenticated browser or deployed end-to-end test was performed.

Limits: audit remains HTML-only (no JavaScript rendering). App-shell detection is heuristic. Diagnostic score is partial when rendering is required; it is not Google ranking data. Search Console remains disconnected. Focus fields preview strategy; permanent business details belong in Business Settings. This release does not add Google OAuth, WhatsApp integrations or route-specific server rendering of public pages.

Install: copy the contents of youyou-assistance-main into your existing GitHub Desktop checkout, replace matching files, preserve .git and your local environment files. Commit and push. No database migration is needed for these changes.

After deployment: verify selected tabs; compare SEO pack/preview/copied text; select each content idea and copy its brief; audit a JavaScript site and a static HTML site; check mobile layout and your saved business settings.
