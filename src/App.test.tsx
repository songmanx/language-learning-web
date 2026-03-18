import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import App from "./App";

describe("App routes", () => {
  it("기본 경로에서 로그인 화면을 렌더링한다", () => {
    render(
      <MemoryRouter initialEntries={["/login"]}>
        <App />
      </MemoryRouter>,
    );

    expect(screen.getByRole("heading", { name: "학습을 시작해 봅시다" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "로그인" })).toBeInTheDocument();
    expect(screen.getByText(/Mock API 모드|정적 JSON 읽기 \+ GAS 저장 모드|GAS 실연동 모드/)).toBeInTheDocument();
  });
});
