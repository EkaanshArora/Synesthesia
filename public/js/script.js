sb = document.getElementById('subbut');
formcorrect = false;
function showFileSize() {
    var input, file;
    input = document.getElementById('fileinput');
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
document.getElementById('fileinput').onchange = function () {
    showFileSize();
};
function validate_fileupload(fileName) {
    var allowed_extensions = new Array("jpg", "png", "jpeg");
    var file_extension = fileName.split('.').pop().toLowerCase(); // split function will split the filename by dot(.), and pop function will pop the last element from the array which will give you the extension as well. If there will be no extension then it will return the filename.

    for (var i = 0; i <= allowed_extensions.length; i++) {
        if (allowed_extensions[i] == file_extension) {
            return true; // valid file extension
        }
    }

    return false;
}

document.getElementById('subbut').onclick = function () {
    if (formcorrect) {
        //getElementById('subbut2').click();
    }
};