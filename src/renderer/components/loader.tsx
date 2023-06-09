import { useSelector } from "react-redux";
import styled from "styled-components";
import { selectTheme } from "../store/themeSlice";

export function Loader() {
  const Wrapper = styled.div`
    width: 100vw;
    height: 100vh;
    position: fixed;
    .loading-Wrapper {
      height: 100px;
      width: 100px;
      position: relative;
      margin: 35vh auto;
    }

    .loading {
      height: 100px;
      width: 100px;
      border-radius: 100%;
      border: 2px solid transparent;
      border-color: transparent #999999 transparent #999999;
      animation: loading_rotate 2s linear infinite;
    }

    .loading-text {
      color: #999999;
      font-family: "Helvetica Neue, " Helvetica ", " "arial";
      font-size: 12px;
      font-weight: bold;
      margin-top: 45px;
      position: absolute;
      text-align: center;
      text-transform: uppercase;
      top: 0;
      width: 102px;
    }
    @keyframes loading_rotate {
      0% {
        transform: rotate(180deg);
      }
      100% {
        transform: rotate(360deg);
      }
    }
  `;

  const theme = useSelector(selectTheme)

  return (
    <Wrapper
     style={{
      background: theme === "light" ? "white" : "#343541",
     }}
    >
      <div className="loading-Wrapper">
        <div className="loading"></div>
        <div className="loading-text">加载中</div>
      </div>
    </Wrapper>
  );
}
