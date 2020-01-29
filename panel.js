function injectedCode() {

    programs = {};
    threeMaterials = {};

     function logMsg() {

            var args = [];
            for (var j = 0; j < arguments.length; j++) {
                args.push(arguments[j]);
            }

            window.postMessage({
                source: 'ThreeLiveRawShaderEditor',
                method: 'log',
                arguments: args
            }, '*');
        }

    if (typeof(TLRSE) == 'undefined') {
        console.log("Three Live Raw Shader Editor: [TLRSE] is not set.\nGo to https://github.com/thefoofighter/ThreeLiveRawShaderEditor to see how to setup TLRSE to edit your Raw Shaders!")
    }else{
        var scene = TLRSE.scene;

        scene.traverse(function(child) {
            if (child.isMesh && child.material.type == "RawShaderMaterial") {
                addProgram(child.material);
                threeMaterials[child.material.uuid] = child.material; 
            }
        });
    }

    function addProgram(p) {
        
        var el = {
            uid:        p.uuid,
            name:       p.name,
            visible:    p.visible,
            frag:       p.fragmentShader,
            vert:       p.vertexShader
        }

        programs[p.uuid] = el;

        window.postMessage({
            source:     'ThreeLiveRawShaderEditor',
            method:     'addProgram',
            uid:        p.uuid,
            name:       p.name,
            visible:    p.visible,
            frag:       p.fragmentShader,
            vert:       p.vertexShader
        }, '*');
    }

    function onUpdateProgram(id, src, type) {

        var scene = TLRSE.scene;

        scene.traverse(function(child) {
            if (child.isMesh && child.material.type == "RawShaderMaterial") {               
                if (child.material.uuid === id) {
                    if(type=='frag'){
                        threeMaterials[id].fragmentShader = src;
                    }

                    if(type=='vert'){
                        threeMaterials[id].vertexShader = src;
                    }

                   TLRSE.compile();
                }
            }
            
        });
    }

    var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';

    function decodeSource(input) {

        var str = String(input).replace(/=+$/, '');
        if (str.length % 4 == 1) {
            throw new InvalidCharacterError("'atob' failed: The string to be decoded is not correctly encoded.");
        }
        for (
            var bc = 0, bs, buffer, idx = 0, output = ''; buffer = str.charAt(idx++); ~buffer && (bs = bc % 4 ? bs * 64 + buffer : buffer,
                bc++ % 4) ? output += String.fromCharCode(255 & bs >> (-2 * bc & 6)) : 0
        ) {
            buffer = chars.indexOf(buffer);
        }

        

        return output;

    }
   

    window.UIVSUpdate = function(id, src) {
        logMsg('UPDATE VS');
        onUpdateProgram(id, decodeSource(src), 'vert');

    }

    window.UIFSUpdate = function(id, src) {

        logMsg('UPDATE FS');
        onUpdateProgram(id, decodeSource(src), 'frag');

    }

    function findProgram(id) {

        if (programs[id]) {
            return programs[id];
        }

        return null;

    }

    function onSelectProgram(id) {

        var program = findProgram(id);

        window.postMessage({
            source: 'ThreeLiveRawShaderEditor',
            method: 'setVSSource',
            code: program.vert
        }, '*');
        window.postMessage({
            source: 'ThreeLiveRawShaderEditor',
            method: 'setFSSource',
            code: program.frag
        }, '*');

    }

    function hideMesh(id){

        var scene = TLRSE.scene;

        scene.traverse(function(child) {
            if (child.isMesh && child.material.type == "RawShaderMaterial") {                
                if (child.material.uuid === id) {
                    child.visible = false;
                }
            }        
        });
    }

    function showMesh(id){

        var scene = TLRSE.scene;

        scene.traverse(function(child) {
            if (child.isMesh && child.material.type == "RawShaderMaterial") {                
                if (child.material.uuid === id) {
                    child.visible = true;
                }
            }        
        });
    }

    window.UIProgramSelected = function(id) {
        onSelectProgram(id);
    }

    window.UIProgramDisabled = function(id) {
        hideMesh(id);
    }

    window.UIProgramEnabled = function(id) {
        showMesh(id);
    }

}

var updatebutton = document.getElementById('updateButton'),
    logbutton = document.getElementById('logButton'),
    infobutton = document.getElementById('infoButton'),
    closeInfoButton = document.getElementById('closeInfoButton'),
    container = document.getElementById('container'),
    info = document.getElementById('info'),
    list = document.getElementById('list'),
    vSFooter = document.getElementById('vs-count'),
    fSFooter = document.getElementById('fs-count'),
    log = document.getElementById('log'), 
    verbose = false;

function logMsg() {

    var args = [];
    for (var j = 0; j < arguments.length; j++) {
        args.push(arguments[j]);
    }
    var p = document.createElement('p');
    p.textContent = args.join(' ');
    log.appendChild(p);

}

logMsg('Starting');

updateButton.addEventListener('click', function(e) {
    tearDown();
    logMsg(chrome.devtools.inspectedWindow.eval('(' + injectedCode.toString() + ')()'));
});

logButton.addEventListener('click', function(e) {
    if(verbose){
        log.style.left = '50%';
        log.style.display = 'none';
        container.style.right = '0%';

        verbose = false;
    }
    else{

        log.style.left = '50%';
        log.style.display = 'block';
        container.style.right = '50%';

        log.addEventListener('click', function(e) {
            this.innerHTML = '';
            e.preventDefault();
        });

        verbose = true;
    }

});

infoButton.addEventListener('click', function(e) {
    info.style.display = 'block';
    container.style.display = 'none';
});

closeInfoButton.addEventListener('click', function(e) {
    info.style.display = 'none';
    container.style.display = 'block';
});

var backgroundPageConnection = chrome.runtime.connect({
    name: 'panel'
});

var options = {
    lineNumbers: true,
    matchBrackets: true,
    indentWithTabs: false,
    tabSize: 4,
    indentUnit: 4,
    mode: "text/x-glsl",
    foldGutter: true,
    gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"],
};

var editorContainer = document.getElementById('editorContainer');
var vsPanel = document.getElementById('vs-panel');
var fsPanel = document.getElementById('fs-panel');

var vSEditor = CodeMirror(vsPanel, options);
var fSEditor = CodeMirror(fsPanel, options);
vSEditor.refresh();
fSEditor.refresh();
vSEditor._errors = [];
fSEditor._errors = [];

vSEditor.getWrapperElement().setAttribute('id', 'vsEditor');
fSEditor.getWrapperElement().setAttribute('id', 'fsEditor');

var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';

function encodeSource(input) {
    var str = String(input);
    for (
        var block, charCode, idx = 0, map = chars, output = ''; str.charAt(idx | 0) || (map = '=', idx % 1); output += map.charAt(63 & block >> 8 - idx % 1 * 8)
    ) {
        charCode = str.charCodeAt(idx += 3 / 4);
        if (charCode > 0xFF) {
            throw new InvalidCharacterError("'btoa' failed: The string to be encoded contains characters outside of the Latin1 range.");
        }
        block = block << 8 | charCode;
    }
    return output;
}

function updateVSCode() {
    updateVSCount();
    var source = vSEditor.getValue();
    if (testShader(gl.VERTEX_SHADER, source, vSEditor)) {
        vsPanel.classList.add('compiled');
        vsPanel.classList.remove('not-compiled');
        chrome.devtools.inspectedWindow.eval('UIVSUpdate( \'' + selectedProgram + '\', \'' + encodeSource(source) + '\' )');
    } else {
        vsPanel.classList.add('not-compiled');
        vsPanel.classList.remove('compiled');
    }

}

function updateFSCode() {
    
    updateFSCount();
    var source = fSEditor.getValue();
    if (testShader(gl.FRAGMENT_SHADER, source, fSEditor)) {
        fsPanel.classList.add('compiled');
        fsPanel.classList.remove('not-compiled');
        chrome.devtools.inspectedWindow.eval('UIFSUpdate( \'' + selectedProgram + '\', \'' + encodeSource(source) + '\' )');

    } else {
        fsPanel.classList.add('not-compiled');
        fsPanel.classList.remove('compiled');
    }

}

function updateVSCount() {

    vSFooter.textContent = vSEditor.getValue().length + ' chars | ' + vSEditor.lineCount() + ' lines';

}

function updateFSCount() {

    fSFooter.textContent = fSEditor.getValue().length + ' chars | ' + fSEditor.lineCount() + ' lines';

}

function selectProgram(li) {

    var prev = list.querySelector('.active');
    if (prev) prev.classList.remove('active');
    li.classList.add('active');

}

var selectedProgram = null;
var programs = {};

function updateProgramName(i, type, name) {
    if (i.name === '' || i.name === undefined ) {
        i.name = 'Program ' + i.number;
    }

    i.nameSpan.textContent = i.name;

}

function tearDown() {

    selectedProgram = null;
    programs = {};
    vSEditor.setValue('');
    vsPanel.classList.remove('not-compiled');
    vsPanel.classList.remove('compiled');
    vSFooter.textContent = '';
    fSEditor.setValue('');
    fsPanel.classList.remove('not-compiled');
    fsPanel.classList.remove('compiled');
    fSFooter.textContent = '';
    while (list.firstChild) list.removeChild(list.firstChild);


}

backgroundPageConnection.onMessage.addListener(function(msg) {

    switch (msg.method) {
        case 'inject':
            logMsg('inject');
           // tearDown();
            break;
        case 'init':
           // console.log('init');
            break;
        case 'addProgram':

            logMsg('Add Program: ' + msg.uid);

            onWindowResize();
            var li = document.createElement('li');
            var span = document.createElement('span');
            span.className = 'visibility';
            span.addEventListener('click', function(e) {
                this.parentElement.classList.toggle('hidden');
                if (this.parentElement.classList.contains('hidden')) {
                    chrome.devtools.inspectedWindow.eval('UIProgramDisabled( \'' + msg.uid + '\' )');
                } else {
                    chrome.devtools.inspectedWindow.eval('UIProgramEnabled( \'' + msg.uid + '\' )');
                }
                e.preventDefault();
                e.stopPropagation();
                return false;
            });
            var nameSpan = document.createElement('span');
            nameSpan.className = 'name';
            li.appendChild(span);
            li.appendChild(nameSpan);
            li.addEventListener('click', function() {
                selectProgram(this);
                selectedProgram = msg.uid;
                chrome.devtools.inspectedWindow.eval('UIProgramSelected( \'' + msg.uid + '\' )');
            });

            list.appendChild(li);

            var d = {
                id: msg.uid,
                li: li,
                nameSpan: nameSpan,
                name: msg.name,
                number: list.children.length
            };

            programs[msg.uid] = d;
            updateProgramName(d);
            break;
        case 'setShaderName':
            logMsg(msg.uid, msg.type, msg.name);
            updateProgramName(programs[msg.uid], msg.type, msg.name);
            break;
        case 'setVSSource':
            vSEditor.setValue(msg.code);
            vSEditor.refresh();
            vsPanel.classList.remove('compiled');
            vsPanel.classList.remove('not-compiled');
            updateVSCount();
            break;
        case 'setFSSource':
            fSEditor.setValue(msg.code);
            fSEditor.refresh();
            fsPanel.classList.remove('compiled');
            fsPanel.classList.remove('not-compiled');
            updateFSCount();
            break;
        case 'log':
            logMsg(msg.arguments);
            break;
    }

});

backgroundPageConnection.postMessage({
    name: 'init',
    tabId: chrome.devtools.inspectedWindow.tabId
});

var keyTimeout = 500;
var vSTimeout;

function scheduleUpdateVS() {

    vsPanel.classList.remove('compiled');
    vsPanel.classList.remove('not-compiled');

    if (vSTimeout) vSTimeout = clearTimeout(vSTimeout);
    vSTimeout = setTimeout(updateVSCode, keyTimeout);

}

var fSTimeout;

function scheduleUpdateFS() {
    fsPanel.classList.remove('compiled');
    fsPanel.classList.remove('not-compiled');

    if (fSTimeout) fSTimeout = clearTimeout(fSTimeout);
    fSTimeout = setTimeout(updateFSCode, keyTimeout);

}

//vSEditor.on( 'change', scheduleUpdateVS );
//fSEditor.on( 'change', scheduleUpdateFS );

vSEditor.on('keyup', scheduleUpdateVS);
fSEditor.on('keyup', scheduleUpdateFS);

var gl = document.createElement('canvas').getContext('webgl');

function testShader(type, source, code) {

    if (source === '') {
        logMsg('NO SOURCE TO TEST');
        return false;
    }

    while (code._errors.length > 0) {

        var mark = code._errors.pop();
        code.removeLineWidget(mark);

    }

    var s = gl.createShader(type);
    gl.shaderSource(s, source);
    gl.compileShader(s);

    var success = gl.getShaderParameter(s, gl.COMPILE_STATUS);
    var err = gl.getShaderInfoLog(s);
    logMsg('ERR:[' + err + ']');

    if (!success || err !== '') {

        if (err) {

            var lineOffset = 0;
            err = err.replace(/(\r\n|\n|\r)/gm, "");

            var lines = [];
            var re = /(error|warning):/gi;
            var matches = [];
            while ((match = re.exec(err)) != null) {
                matches.push(match.index);
            }
            matches.push(err.length);
            for (var j = 0; j < matches.length - 1; j++) {
                var p = matches[j];
                lines.push(err.substr(p, matches[j + 1] - p));
            }

            for (var j = 0; j < lines.length; j++) {
                logMsg('[[' + lines[j] + ']]');
            }

            for (var i = 0; i < lines.length; i++) {

                var parts = lines[i].split(":");

                var isWarning = parts[0].toUpperCase() === "WARNING";

                if (parts.length === 5 || parts.length === 6) {

                    var lineNumber = parseInt(parts[2]) - lineOffset;
                    if (isNaN(lineNumber)) lineNumber = 1;

                    var msg = document.createElement("div");
                    msg.appendChild(document.createTextNode(parts[3] + " : " + parts[4]));
                    msg.className = isWarning ? 'warningMessage' : 'errorMessage';
                    var mark = code.addLineWidget(lineNumber - 1, msg, {
                        coverGutter: false,
                        noHScroll: true
                    });

                    code._errors.push(mark);

                } else if (lines[i] != null && lines[i] != "" && lines[i].length > 1 && parts[0].toUpperCase() != "WARNING") {

                    logMsg(parts[0]);

                    var txt = 'Unknown error';
                    if (parts.length == 4)
                        txt = parts[2] + ' : ' + parts[3];

                    var msg = document.createElement("div");
                    msg.appendChild(document.createTextNode(txt));
                    msg.className = isWarning ? 'warningMessage' : 'errorMessage';
                    var mark = code.addLineWidget(0, msg, {
                        coverGutter: false,
                        noHScroll: true,
                        above: true
                    });

                    code._errors.push(mark);

                }

            }
        }

    }

    return success;

}

window.addEventListener('resize', onWindowResize);

function onWindowResize() {

    editorContainer.classList.toggle('vertical', editorContainer.clientWidth < editorContainer.clientHeight);

}