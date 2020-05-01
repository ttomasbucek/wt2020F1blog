import { render } from "mustache";

function AshowFileUpload() {
  document.getElementById("AfsetFileUpload").classList.remove("hiddenElm");
  document.getElementById("AbtShowFileUpload").classList.add("hiddenElm");
}

function AcancelFileUpload() {
  document.getElementById("AfsetFileUpload").classList.add("hiddenElm");
  document.getElementById("AbtShowFileUpload").classList.remove("hiddenElm");
}

function showCommentForm() {
  document.getElementById("baddComment").classList.add("hiddenElm");
  document.getElementById("faddComment").classList.remove("hiddenElm");
  if (auth2)
    document.getElementById("aCauthor").value = auth2.currentUser
      .get()
      .getBasicProfile()
      .getName();
}

function hideCommentForm() {
  document.getElementById("faddComment").classList.add("hiddenElm");
  document.getElementById("baddComment").classList.remove("hiddenElm");
}

/**
 * Uploads an image to the server
 * @param serverUrl - basic part of the server url, without the service specification, i.e.  https://wt.kpi.fei.tuke.sk/api.
 */
function addUploadImg(serverUrl) {
  const files = document.getElementById("AflElm").files;

  if (files.length > 0) {
    const imgLinkElement = document.getElementById("AimageLink");
    const fieldsetElement = document.getElementById("AfsetFileUpload");
    const btShowFileUploadElement = document.getElementById(
      "AbtShowFileUpload"
    );

    //1. Gather  the image file data
    let imgData = new FormData();
    imgData.append("file", files[0]);

    //2. Set up the request
    const postReqSettings = {
      method: "POST",
      body: imgData
    };

    //3. Execute the request
    fetch(`${serverUrl}/fileUpload`, postReqSettings)
      .then(response => {
        if (response.ok) {
          return response.json();
        } else {
          return Promise.reject(
            new Error(
              `Server answered with ${response.status}: ${response.statusText}.`
            )
          );
        }
      })
      .then(responseJSON => {
        imgLinkElement.value = responseJSON.fullFileUrl;
        btShowFileUploadElement.classList.remove("hiddenElm");
        fieldsetElement.classList.add("hiddenElm");
      })
      .catch(error => {
        window.alert(`Image uploading failed. ${error}.`);
      });
  } else {
    window.alert("Please, choose an image file.");
  }
}

//spracovanie formulara
function processArticleForm(event) {
  event.preventDefault();

  //1. Gather and check the form data

  const articleData = {
    title: document.getElementById("Atitle").value.trim(),
    content: document.getElementById("Acontent").value.trim(),
    author: document.getElementById("Aauthor").value.trim(),

    imageLink: document.getElementById("AimageLink").value.trim(),
    tags: document.getElementById("Atags").value.trim()
  };

  if (!(articleData.title && articleData.content)) {
    window.alert("Please, enter article title and content");
    return;
  }

  if (!articleData.author) {
    articleData.author = "Anonymous";
  }

  if (!articleData.imageLink) {
    delete articleData.imageLink;
  }

  if (!articleData.tags) {
    delete articleData.tags;
  } else {
    articleData.tags = articleData.tags.split(",");
    articleData.tags = articleData.tags.map(tag => tag.trim());

    articleData.tags = articleData.tags.filter(tag => tag);
    if (articleData.tags.length === 0) {
      delete articleData.tags;
    }
  }

  //2. Set up the request
  const postReqSettings = {
    method: "POST",
    headers: {
      "Content-Type": "application/json;charset=utf-8"
    },
    body: JSON.stringify(articleData)
  };

  //3. Execute the request
  fetch("https://wt.kpi.fei.tuke.sk/api/article", postReqSettings)
    .then(response => {
      if (response.ok) {
        return response.json();
      } else {
        return Promise.reject(
          new Error(
            `Server answered with ${response.status}: ${response.statusText}.`
          )
        );
      }
    })
    .then(responseJSON => {
      window.alert("Article successfully saved on server");
    })
    .catch(error => {
      window.alert(`Failed to upload article on server. ${error}`);
    })
    .finally(() => (window.location.hash = "#welcome"));
}

function addComment(event) {
  event.preventDefault();

  const commentData = {
    author: document.getElementById("aCauthor").value.trim(),
    text: document.getElementById("aCtext").value.trim()
  };

  if (!commentData.text) {
    window.alert("Please enter text.");
    return;
  }

  if (!commentData.author) commentData.author = "Anonymous";

  const postReqSettings = {
    method: "POST",
    headers: {
      "Content-Type": "application/json;charset=utf-8"
    },
    body: JSON.stringify(commentData)
  };

  const hash = window.location.hash;
  const hashpasts = hash.split("/");

  fetch(
    "https://wt.kpi.fei.tuke.sk/api/article/" + hashpasts[1] + "/comment",
    postReqSettings
  )
    .then(response => {
      if (response.ok) {
        return response.json();
      } else {
        return Promise.reject(
          new Error(
            `Server answered with ${response.status}: ${response.statusText}.`
          )
        );
      }
    })
    .then(responseJSON => {
      window.alert("Comment successfully saved on server");
    })
    .catch(error => {
      window.alert(`Failed to upload comment on server. ${error}`);
    })
    .finally(() => {
      document.getElementById("router-view").innerHTML += render(
        document.getElementById("template-article-comment").innerHTML,
        commentData
      );
    });
}
