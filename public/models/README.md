# 3D background model

Drop your Sketchfab model here as **`scene.glb`** (this exact name and folder):

    public/models/scene.glb

It's loaded by `BackgroundModel` and registered in
`src/app/layout/webgl-canvas/webgl-canvas.ts`. The asset is auto-centered and
rescaled, and any embedded animation clips play automatically.

## Getting a model from Sketchfab

1. Pick a model that is **Downloadable** (filter: Downloadable + a license you
   can use — most are CC Attribution, so credit the author).
2. Download the **glTF** format. You'll get either a single `.glb` or a folder
   with `.gltf` + `.bin` + textures.
   - If you got a `.glb`, rename it to `scene.glb` and drop it here.
   - If you got a `.gltf` set, keep all files together and point the loader at
     the `.gltf` instead (update `url` in `webgl-canvas.ts`).
3. Prefer the **glTF** download over FBX/OBJ — it carries materials and
   animations and loads natively in three.js.

## Tuning

Adjust these in `webgl-canvas.ts` once you see it in place:

- `size` — longest-axis size in world units (bigger = closer/larger).
- `position` — `[x, y, z]`; more negative `z` pushes it further back.
- `spin` / `parallax` — idle motion and mouse-follow strength.
- `scrollDepth` — how far it recedes as you scroll the page.
- `timeScale` — playback speed of the model's own animation.

## Notes

- If the file is missing, nothing breaks — the loader just logs a warning and
  the layer stays invisible.
- Keep an eye on file size; it counts toward the page weight. Aim for a few MB.
- **Draco-compressed** glTF needs a `DRACOLoader`. If your download won't load,
  re-export uncompressed, or ask and I'll wire up Draco support.

## Attribution

If your model's license requires credit, add it to the site footer / a credits
section. Keep a note of the author + model URL here:

    Model: <name> by <author> — <sketchfab url> (<license>)
