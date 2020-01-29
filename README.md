# Three Live Raw Shader Editor from Chrome & Firefox
Chrome &amp; FireFox Dev Tools Extension to live edit your ThreeJS  Raw Shaders for instance visual feedback. Built from [@thespite's](https://twitter.com/thespite) great [WebGL GLSL Shader Editor Extension for Google Chrome](https://github.com/spite/ShaderEditorExtension)

### How to install ###

GitHub Release:
Chrome: coming soon
Firefox: coming soon

Chrome: Load the extension from disk directly:
- Checkout the repo
- Open Chrome's Extensions page (``Settings / More tools / Extensions``)
- Enable ``Developer Mode``
- Click on ``Load unpacked extension``...
- Select the folder /src in the checked out project

Firefox: Load the extension from disk directly:
- Checkout the repo
- Open Firefox's Addon page (``Tools / Addons``)
- Enable ``Enable Debug Addons from the Cog/Gear Icon``
- Click on ``Load Temporary Add-on``...
- Select the ``manifest.json`` file from the folder you downloaded of the project

### How to use ###

- This Extension requires that you expose a specific javascript variable from your app. (If you know of a better way to find the loaded instance of THREE and expose the renderer, camera and scene in a browser do let me know)
- Add the following class and ``TLRSE`` variable to the top of your ThreeJS app 
```
class ThreeLiveRawShaderEditor {

    constructor(renderer, camera, scene) {
       this.renderer = renderer;
       this.camera = camera;
       this.scene = scene;
    }

    compile(){
        renderer.compile(scene, camera);
    }
}

var TLRSE;
```
- Then from within your init method or wherever you create the Scene, Renderer and Camera set them to the TLRSE constructor like so:
```
// ======== THREE LIVE RAW SHADER EDITOR =========
TLRSE = new ThreeLiveRawShaderEditor(renderer, camera, scene);
```
- Then navigate to your Three app in your browser
- Open the developer tools
- Open the Three Live Raw Shader Editor Tab
- Once you know your app has loaded fully in the browser click the Update/Refresh icon in the bottom left of the panel
- If your Three App has any Raw shaders they will populate the list to the left
- Clicking on one of these programs will load the Vertex and Fragment GLSL into their respective panes for editing
- Make changes to your code, An OnKeyUp Event is monitored for each Code pane which when triggered will send valid GLSL to Three for compilation or alert you of a syntax error.
- Clicking on the Eye Icon on each Program in the list will show or hide the selected material

### How it works ###

- It's nothing special really. We simply expose a variable called TLRSE which holds a THREE scene, renderer and camera all of which are required by THREE to call the native renderer.compile(scene, camera) function.
- This function is called when we make edits to our vertex or shader code

### TO-DO ###

Forks, pull requests and code critiques are welcome!

- Find a better way that doesnt require devs adding the TLRSE variable to their projects
- Uniform viewer and editor
- Comment the code

#### License ####

MIT licensed

Copyright (C) 2020 Cathal McNally, www.cathalmcnally.com