sb = document.getElementById('subbut');
formcorrect = false;

function showFileSize() {
    var input, file;
    input = document.getElementById('file-1');
    if (!input.files[0]) {
        bodyAppend("p", "Please select a file");
        formcorrect = false;
    }
    else {
        file = input.files[0];
        if (file.size > 2100000) {
            if (validate_fileupload(file.name)) {
                bodyAppend("", "Please select a file under 2MB.");
                formcorrect = false;
            }
            else {
                bodyAppend("", "Please select .jpg or .png file");
                formcorrect = false;
            }
        }
        else if (validate_fileupload(file.name)) {
            bodyAppend("", "")
            formcorrect = true;
        }
        else {
            bodyAppend("", "Please select .jpg or .png file");
            formcorrect = false;
        }
    }
}

function bodyAppend(tagName, innerHTML) {
    var elm = document.getElementById("fileval");
    elm.innerHTML = innerHTML;
}

document.getElementById('file-1').onchange = function () {
    showFileSize();
    if(formcorrect){
        sb.disabled = false;
    } else{
        sb.disabled = true;
    }
};

function validate_fileupload(fileName) {
    var allowed_extensions = new Array("jpg", "png", "jpeg");
    var file_extension = fileName.split('.').pop().toLowerCase();

    for (var i = 0; i <= allowed_extensions.length; i++) {
        if (allowed_extensions[i] == file_extension) {
            return true; 
        }
    }
    return false;
}

showFileSize();
if(formcorrect){
    sb.disabled = false;
} else{
    sb.disabled = true;
}
