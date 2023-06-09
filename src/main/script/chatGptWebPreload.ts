// In guest page.
import { ipcRenderer } from "electron";
import { customPromptValue } from "./model";

let textInputDom: null | HTMLInputElement;

function initTextInputDom() {
  textInputDom = document.querySelector("#prompt-textarea");
}

// assemblePrompt in guest page
ipcRenderer.on("assemblePrompt", (_, value: customPromptValue) => {
  console.log("assemblePrompt", value);
  console.log(window);

  if (!textInputDom) {
    initTextInputDom();
  }
  // 使用js模拟输入事件，并且输入字符
  textInputDom!.value = value.prompt;
  const inputEvent = document.createEvent("HTMLEvents");
  inputEvent.initEvent("input", true, true);
  textInputDom!.dispatchEvent(inputEvent);
  // 模拟点击按钮

  value.isNeedSend &&
    setTimeout(() => {
      const btn = document.querySelector("#prompt-textarea ~ button");
      setTimeout((btn as any).click(), 1000);
    });
});

function addNewModels() {
  if (!window.fetch) return;
  // const oldFetch = window.fetch;
  // window.fetch = async function (url, options) {
  //   let res = await oldFetch.apply(this, [url, options]);
  //   if (url.toString().indexOf("/backend-api/models") !== -1) {
  //     const data = await res.clone().json();
  //     data.categories.map((category: any) => {
  //       if (category.category === "gpt_4") {
  //         category.default_model = "gpt-4";
  //       }
  //     });
  //     if (data.models.find((model: any) => model.slug === "gpt-4-mobile")) {
  //       data.categories.push({
  //         category: "gpt_4",
  //         default_model: "gpt-4-mobile",
  //         human_category_name: "GPT-4-Mobile",
  //         subscription_level: "plus",
  //       });
  //     }
  //     res = new Response(JSON.stringify(data), res);
  //     console.log('models', data)
  //   }
  //   return res;
  // };
}

function observeTheme() {
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === "attributes") {
        // rpc between main and guest page
        // @ts-ignore
        ipcRenderer.sendToHost("theme", mutation.target.className);
      }
    });
  });
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
    childList: false,
  });
}

document.addEventListener("DOMContentLoaded", () => {
  addNewModels();
  observeTheme();
});
