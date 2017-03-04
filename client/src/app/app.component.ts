import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  upload() {

    var uploadForm = document.forms['ajaxUploadForm'];
    var formData = new FormData(),
      uploadedImages = uploadForm['uploadedImages'].files;

    for (var i = 0; i < uploadedImages.length; i++) {
      formData.append('file', uploadedImages[i], uploadedImages[i].name);
    };

    this.ajaxx(formData, this.appendImages);
  };

  appendImages(responseText, status) {
    var uploadedImagesContainer = document.getElementById('uploadedImages');

    responseText['uploadedFileNames'].forEach(function (value) {
      uploadedImagesContainer.innerHTML += '<img src="' + value.url + '" width="150" />';
    });

  }

  ajaxx(data, responseHandler) {
    // Set the variables
    let url = "http://localhost:1526/uploadFiles";
    data = data || null;
    responseHandler = responseHandler || function () { };

    var xmlHttpRequst = new XMLHttpRequest();


    xmlHttpRequst.onreadystatechange = function () {
      if (xmlHttpRequst.readyState == 4) {
        if (xmlHttpRequst.status == 200) {
          responseHandler(JSON.parse(xmlHttpRequst.responseText), xmlHttpRequst.status);
        } else {
          responseHandler(xmlHttpRequst.responseText, xmlHttpRequst.status);
        }
      }
    };
    // Send data
    xmlHttpRequst.open("POST", url, true);
    xmlHttpRequst.send(data);
  };
}
