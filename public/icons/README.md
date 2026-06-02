# Tech-stack icons

The rotating orbit in the About section loads these files. Save your logos here
with these exact names (PNG with transparent background works best):

    public/icons/angular.png
    public/icons/figma.png
    public/icons/html.png
    public/icons/javascript.png
    public/icons/wix.png
    public/icons/wordpress.png

To add/remove/rename icons, edit the `stack` array in
`src/app/sections/about/about.ts` (each entry is `{ name, icon }`). The orbit
spaces them evenly automatically, so any number of icons works.

Tuning (in `src/app/sections/about/about.scss`, on `.tech-orbit`):

- `--r`   — orbit radius (how far icons sit from the center).
- `--isz` — icon tile size.
- `orbit-spin` duration (currently 34s) — rotation speed.
