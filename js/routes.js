import { render } from "mustache";

//an array, defining the routes
export default [
  {
    //the part after '#' in the url (so-called fragment):
    hash: "welcome",
    ///id of the target html element:
    target: "router-view",
    //the function that returns content to be rendered to the target html element:
    getTemplate: targetElm =>
      (document.getElementById(targetElm).innerHTML = document.getElementById(
        "template-welcome"
      ).innerHTML)
  },

  {
    hash: "articles",
    target: "router-view",
    getTemplate: fetchAndDisplayArticles
  },

  {
    hash: "opinions",
    target: "router-view",
    getTemplate: createHtml4opinions
  },

  {
    hash: "addOpinion",
    target: "router-view",
    getTemplate: targetElm => {
      document.getElementById(targetElm).innerHTML = document.getElementById(
        "template-addOpinion"
      ).innerHTML;
      if (auth2) {
        document.getElementById("name").value = auth2.currentUser
          .get()
          .getBasicProfile()
          .getName();
        document.getElementById("email").value = auth2.currentUser
          .get()
          .getBasicProfile()
          .getEmail();
      }
    }
  },

  {
    hash: "artInsert",
    target: "router-view",
    getTemplate: targetElm => {
      document.getElementById(targetElm).innerHTML = document.getElementById(
        "template-article-add"
      ).innerHTML;
      if (auth2)
        document.getElementById("Aauthor").value = auth2.currentUser
          .get()
          .getBasicProfile()
          .getName();
    }
  },

  {
    hash: "article",
    target: "router-view",
    getTemplate: fetchAndDisplayArticleDetail
  },

  {
    hash: "artEdit",
    target: "router-view",
    getTemplate: editArticle
  },

  {
    hash: "artDelete",
    target: "router-view",
    getTemplate: deleteArticle
  },

  {
    hash: "artInsert",
    target: "router-view"
    // getTemplate: addArticle
  },

  {
    hash: "artComment",
    target: "router-view"
  }
];

const urlBase = "https://wt.kpi.fei.tuke.sk/api";
const articlesPerPage = 20;

function createHtml4opinions(targetElm) {
  const opinionsFromStorage = localStorage.myPageComments;
  let opinions = [];

  if (opinionsFromStorage) {
    opinions = JSON.parse(opinionsFromStorage);
    opinions.forEach(opinion => {
      opinion.created = new Date(opinion.created).toDateString();
      opinion.is_good_source = opinion.is_good_source
        ? "TÃ¡to strÃ¡nka je dobrÃ½m zdrojom informÃ¡ciÃ­."
        : "TÃ¡to strÃ¡nka neobsahuje dostatok informÃ¡ciÃ­.";
    });
  }

  document.getElementById(targetElm).innerHTML = render(
    document.getElementById("template-opinions").innerHTML,
    opinions
  );
}

async function fetchAndDisplayArticles(targetElm, current, totalCount) {
  //pre ziskanie vsetkych clankov odstranit tag tu a na riadku 135
  const url =
    "https://wt.kpi.fei.tuke.sk/api/article/?tag=formula&max=20&offset=";
  const urlA = "https://wt.kpi.fei.tuke.sk/api/article/";

  const articlesJSON = [];
  fetch(
    current === undefined || current <= 0 ? url + 1 : url + (current - 1) * 20
  )
    .then(response => {
      if (response.ok) {
        return response.json();
      } else {
        //if we get server error
        return Promise.reject(
          new Error(
            `Server answered with ${response.status}: ${response.statusText}.`
          )
        );
      }
    })
    .then(async responseJSON => {
      addArtDetailLink2ResponseJson(responseJSON);
      for (let i = 0; i < 20; i++) {
        if (responseJSON.articles[i]) {
          let aid = responseJSON.articles[i].id;
          await fetch(urlA + aid)
            .then(response => {
              if (response.ok) {
                return response.json();
              } else {
                return Promise.reject(
                  new Error(
                    `Server answered with ${response.status}: ${
                      response.statusText
                    }.`
                  )
                );
              }
            })
            .then(respJSON => {
              articlesJSON[i] = respJSON;
              articlesJSON[i].detailLink = responseJSON.articles[i].detailLink;
              //document.getElementById(targetElm).innerHTML = Mustache.render(document.getElementById("template-articles").innerHTML, respJSON);
            })
            .catch(error => {
              const errMsgObj = { errMessage: error };
              document.getElementById(targetElm).innerHTML = render(
                document.getElementById("template-articles-error").innerHTML,
                errMsgObj
              );
            });
        }
      }
      return articlesJSON;
    })
    .then(articlesJSON => {
      document.getElementById(targetElm).innerHTML = render(
        document.getElementById("template-articles").innerHTML,
        articlesJSON
      );

      const urlB = urlA + "?tag=formula";
      fetch(urlB)
        .then(response => {
          if (response.ok) {
            return response.json();
          } else {
            //if we get server error
            return Promise.reject(
              new Error(
                `Server answered with ${response.status}: ${
                  response.statusText
                }.`
              )
            );
          }
        })
        .then(respJSON => {
          const total = respJSON.meta.totalCount;
          current = parseInt(current);
          totalCount = parseInt(totalCount);

          const curApage = current;
          const arCount = Math.floor(total / 20 + 1);

          const data4rendering = {
            currPage: curApage,
            pageCount: arCount
          };

          if (curApage > 1) {
            data4rendering.prevPage = current - 1;
          }

          if (curApage < arCount) {
            data4rendering.nextPage = current + 1;
          }

          document.getElementById(targetElm).innerHTML += render(
            document.getElementById("template-main").innerHTML,
            data4rendering
          );

          const article4rendering = {
            currPage: current,
            pageCount: totalCount
          };

          document.getElementById("article-router-view").innerHTML = render(
            document.getElementById("template-articlenav").innerHTML,
            article4rendering
          );
        });
    })
    .catch(error => {
      //here we process all the failed promises
      const errMsgObj = { errMessage: error };
      document.getElementById(targetElm).innerHTML = render(
        document.getElementById("template-articles-error").innerHTML,
        errMsgObj
      );
    });
}

function addArtDetailLink2ResponseJson(responseJSON) {
  responseJSON.articles = responseJSON.articles.map(article => ({
    ...article,
    detailLink: `#article/${article.id}/${Math.floor(
      responseJSON.meta.offset / 20
    ) + 1}/${Math.floor(responseJSON.meta.totalCount / 20) + 1}/1/100`
  }));
}

function fetchAndDisplayArticleDetail(
  targetElm,
  artIdFromHash,
  offsetFromHash,
  totalCountFromHash
) {
  fetchAndProcessArticle(...arguments, false);
}

function editArticle(
  targetElm,
  artIdFromHash,
  offsetFromHash,
  totalCountFromHash
) {
  fetchAndProcessArticle(...arguments, true);
}

/**
 * Gets an article record from a server and processes it to html according to the value of the forEdit parameter.
 * Assumes existence of the urlBase global variable with the base of the server url (e.g. "https://wt.kpi.fei.tuke.sk/api"),
 * availability of the Mustache.render() function and Mustache templates with id="template-article" (if forEdit=false)
 * and id="template-article-form" (if forEdit=true).
 * @param targetElm - element to which the acquired article record will be rendered using the corresponding template
 * @param artIdFromHash - id of the article to be acquired
 * @param offsetFromHash - current offset of the article list display to which the user should return
 * @param totalCountFromHash - total number of articles on the server
 * @param commentOffset - total number of comments on the server
 * @param commentTotal - total number of comments on the server
 * @param forEdit - if false, the function renders the article to HTML using the template-article for display.
 *                  If true, it renders using template-article-form for editing.
 */
function fetchAndProcessArticle(
  targetElm,
  artIdFromHash,
  offsetFromHash,
  totalCountFromHash,
  commentOffset,
  commentTotal,
  forEdit
) {
  const url = `${urlBase}/article/${artIdFromHash}`;

  fetch(url)
    .then(response => {
      if (response.ok) {
        return response.json();
      } else {
        //if we get server error
        return Promise.reject(
          new Error(
            `Server answered with ${response.status}: ${response.statusText}.`
          )
        );
      }
    })
    .then(responseJSON => {
      if (forEdit) {
        responseJSON.formTitle = "Article Edit";
        responseJSON.formSubmitCall = `processArtEditFrmData(event,${artIdFromHash},${offsetFromHash},${totalCountFromHash},'${urlBase}')`;
        responseJSON.submitBtTitle = "Save article";
        responseJSON.urlBase = urlBase;

        responseJSON.backLink = `#article/${artIdFromHash}/${offsetFromHash}/${totalCountFromHash}/1/100`;

        document.getElementById(targetElm).innerHTML = render(
          document.getElementById("template-article-form").innerHTML,
          responseJSON
        );
      } else {
        responseJSON.backLink = `#articles/${offsetFromHash}/${totalCountFromHash}/1/100`;
        responseJSON.editLink = `#artEdit/${
          responseJSON.id
        }/${offsetFromHash}/${totalCountFromHash}/1/100`;
        responseJSON.deleteLink = `#artDelete/${
          responseJSON.id
        }/${offsetFromHash}/${totalCountFromHash}/1/100`;

        document.getElementById(targetElm).innerHTML = render(
          document.getElementById("template-article").innerHTML,
          responseJSON
        );

        const coffset = parseInt(commentOffset);
        fetch(url + "/comment?max=10&offset=" + (coffset - 1) * 10)
          .then(response => {
            if (response.ok) {
              return response.json();
            } else {
              //if we get server error
              return Promise.reject(
                new Error(
                  `Server answered with ${response.status}: ${
                    response.statusText
                  }.`
                )
              );
            }
          })
          .then(responseJSON => {
            const commentCount =
              Math.floor(responseJSON.meta.totalCount / 10) + 1;
            document.getElementById("komentare").innerHTML = "";
            for (let i = 0; i < 10; i++) {
              if (responseJSON.comments[i])
                document.getElementById("komentare").innerHTML += render(
                  document.getElementById("template-article-comment").innerHTML,
                  responseJSON.comments[i]
                );
            }

            const nav = {
              CcurrPage: coffset,
              CpageCount: commentCount,
              currPage: offsetFromHash,
              pageCount: totalCountFromHash,
              id: artIdFromHash
            };
            if (nav.CcurrPage > 1) nav.CprevPage = nav.CcurrPage - 1;
            if (nav.CcurrPage < nav.CpageCount)
              nav.CnextPage = nav.CcurrPage + 1;
            document.getElementById("komentare").innerHTML += render(
              document.getElementById("template_nav_comment").innerHTML,
              nav
            );
          });
      }
    })
    .catch(error => {
      ////here we process all the failed promises
      const errMsgObj = { errMessage: error };
      document.getElementById(targetElm).innerHTML = render(
        document.getElementById("template-articles-error").innerHTML,
        errMsgObj
      );
    });
}

function deleteArticle(
  targetElm,
  artIdFromHash,
  offsetFromHash,
  totalCountFromHash
) {
  fetchAndDisplayArticles(targetElm, offsetFromHash, totalCountFromHash);
  const url = `${urlBase}/article/${artIdFromHash}`;
  const deleteSettings = {
    method: "DELETE"
  };
  fetch(url, deleteSettings)
    .then(response => {
      if (response.ok) {
        window.alert("ÄlÃ¡nok bol odstrÃ¡nenÃ½.");
        //return response.json();
      } else {
        //if we get server error
        return Promise.reject(
          new Error(
            `Server answered with ${response.status}: ${response.statusText}.`
          )
        );
      }
    })
    .catch(error => {
      ////here we process all the failed promises
      const errMsgObj = { errMessage: error };
      document.getElementById(targetElm).innerHTML = render(
        document.getElementById("template-articles-error").innerHTML,
        errMsgObj
      );
    });
}
