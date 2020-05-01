import { render } from "mustache";
import Router from "./paramHashRouter.js";
import Routes from "./routes.js";

window.router = new Router(Routes, "welcome");

const article4rendering = {
  currPage: 1,
  pageCount: 5
};

document.getElementById("article-router-view").innerHTML += render(
  document.getElementById("template-articlenav").innerHTML,
  article4rendering
);
