import {
  forwardRef,
  useEffect,
  useRef,
  useState,
  useImperativeHandle,
} from "react";
import styled from "styled-components";
import { Loader } from "../../components/loader";
import { SideContentPopupButton } from "../../components/sideButton/SideContentPopupButton";
import { PrompList } from "../../components/promptList/PromptList";
import { setTheme } from "../../store/themeSlice";
import { useDispatch } from 'react-redux'
import { SystemModel } from "../../../store/model";
import { customPromptValue } from "../../../main/script/model";

const Wrapper = styled.div`
  width: 100%;
  height: 100%;
  webview {
    width: 100%;
    height: 100%;
    display: inline-flex;
    position: fixed;
    background-color: #fff;
    opacity: 0;
  }
`;

export const ChatGPTWeb = forwardRef((_, ref) => {

  const dispatch = useDispatch();


  // webviewDom
  let webviewRef = useRef<any>(null);

  const [showFloatBox, setShowFloatBox] = useState(false);

  const [promptList, setPromptList] = useState<any>();

  // load userSetting
  useEffect(() => {
    console.log("chatGptWeb useEffect");
    updateUserSetting();

    // async function 
    ; (async () => {
      const { theme: loctalTheme } = await (window as any).electronAPI.getSystemSetting();
      dispatch(setTheme(loctalTheme))
      window.localStorage.setItem("theme", loctalTheme);
    })()
  }, []);

  // update userSetting
  const updateUserSetting = async () => {
    console.log("updateUserSetting");
    const userSetting = JSON.parse(
      window.localStorage.getItem("userSetting") || "{}"
    );
    const expiredTime = window.localStorage.getItem("userSettingExpired");
    // if not array type
    if (!Array.isArray(userSetting?.chatGPT?.prompts) || (expiredTime && Date.now() > Number(expiredTime))) {
      const value = await (window as any).electronAPI.onLoadUserSetting()
      window.localStorage.setItem('userSetting', JSON.stringify(value))
      // set a expired time
      window.localStorage.setItem('userSettingExpired', JSON.stringify(Date.now() + 1000 * 60 * 60 * 24))
      setPromptList([...value?.chatGPT?.prompts]);
      console.log('first update')
      return
    }
    console.log('update', userSetting)
    setPromptList([...userSetting?.chatGPT?.prompts]);
  };

  useImperativeHandle(ref, () => ({ updateUserSetting }));

  useEffect(() => {
    webviewRef.current.addEventListener("did-fail-load", (error: Error) => {
      console.log(error);
    });
    webviewRef.current.addEventListener("did-finish-load", (event: any) => {
      console.log("loaded", event);
      // change webview opacity
      webviewRef.current.style.opacity = "1";
      // webviewRef.current.openDevTools();
      webviewRef.current.addEventListener("ipc-message", (event: any) => {
        // change theme
        if (event.channel === "theme") {
          // set redux and main process store
          dispatch(setTheme(event.args[0]));
          const systemSetting: SystemModel = {
            theme: event.args[0]
          };
          (window as any).electronAPI.saveSystemSetting(systemSetting);
        }
      });
      if (webviewRef.current.getURL() === "https://chat.openai.com/") {
        setShowFloatBox(true);
      } else {
        const timer = setInterval(() => {
          if (webviewRef.current.getURL() === "https://chat.openai.com/") {
            setShowFloatBox(true);
            clearInterval(timer);
          }
        }, 1000);
      }
    });
  });

  function assemblePrompt(value: customPromptValue) {
    webviewRef.current.send("assemblePrompt", value);
    console.log("assemblePrompt 1");
  }
  return (
    <Wrapper>
      <Loader />
      <webview
        nodeintegration
        ref={webviewRef}
        src="https://chat.openai.com/"
      ></webview>
      <SideContentPopupButton>
        <PrompList
          list={promptList}
          showFloatBox={showFloatBox}
          onAssemblePrompt={assemblePrompt}
        />
      </SideContentPopupButton>
    </Wrapper>
  );
});
1