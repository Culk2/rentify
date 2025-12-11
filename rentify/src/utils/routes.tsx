import { createBrowserRouter } from "react-router";
import { RootLayout } from "../components/RootLayout";
import { HomePage } from "../pages/HomePage";
import { ItemDetailPage } from "../pages/ItemDetailPage";
import { ChatPage } from "../pages/ChatPage";
import { MyRentalsPage } from "../pages/MyRentalsPage";
import { AddItemPage } from "../pages/AddItemPage";
import { LoginPage } from "../pages/LoginPage";
import { SignupPage } from "../pages/SignupPage";
import { NotFound } from "../pages/NotFound";

export const router = createBrowserRouter([
  {
    path: "/login",
    Component: LoginPage,
  },
  {
    path: "/signup",
    Component: SignupPage,
  },
  {
    path: "/",
    Component: RootLayout,
    children: [
      { index: true, Component: HomePage },
      { path: "item/:id", Component: ItemDetailPage },
      { path: "chat", Component: ChatPage },
      { path: "chat/:userId", Component: ChatPage },
      { path: "my-rentals", Component: MyRentalsPage },
      { path: "add-item", Component: AddItemPage },
      { path: "*", Component: NotFound },
    ],
  },
]);