import React, {FunctionComponent} from 'react';
import {Switch, Route, useLocation, useHistory} from "react-router-dom";

import {ProtectedRoute} from "../protected-route/protected-route";

import {IngredientDetailsPage} from "../../pages/ingredient-details-page/ingredient-details-page";

import {useAppDispatch, useSelector} from "../../services/types/hooks";

import main from './app.module.css';

import {getBurgerDataFromServer} from "../../services/actions/burger-data";
import {getUser} from "../../services/actions/user";

import AppHeader from "../app-header/app-header";

import {BurgerConstructorPage} from "../../pages/burger-constructor-page/burger-constructor-page";
import {AuthorisationPage} from "../../pages/authorisation-page/authorisation-page";
import {RegistrationPage} from "../../pages/register-page/register-page";
import {ForgotPasswordPage} from "../../pages/forgor-password-page/forgor-password-page";
import {ResetPasswordPage} from "../../pages/reset-password-page/reset-password-page";
import {AccountPage} from "../../pages/profile-page/profile-page";
import {ProfileDetails} from "../profile-details/profile-details";
import {getCookie} from "../../utils/burger-data";
import {LogoutPage} from "../../pages/logout-page/logout-page";
import {NotFound404} from "../../pages/not-found-404/not-found-404";
import {TLocationState} from "../../services/types/data";
import {Modal} from "../modal/modal";
import {IngredientDetails} from "../ingredient-details/ingredient-details";
import {FeedPage} from "../../pages/feed-page/feed-page";
import {OrderDetailsPage} from "../../pages/order-details-page/order-details-page";
import {OrderDetails} from "../order-details/order-details";
import {MyOrdersPage} from "../../pages/my-orders-page/my-orders-page";
import {wsActions} from "../../services/toolkit-slices/orders-feed";
import {wsActionsSecured} from "../../services/toolkit-slices/user-orders-feed";

const App: FunctionComponent = () => {
  const {burgerDataState, ordersFeedState, userOrdersFeedState} = useSelector(state => {
    return state
  });

  const dispatch = useAppDispatch();
  const history = useHistory();

  let location = useLocation<TLocationState>();
  // This piece of state is set when one of the
  // gallery links is clicked. The `background` state
  // is the location that we were at when one of
  // the gallery links was clicked. If it's there,
  // use it as the location for the <Switch> so
  // we show the gallery in the background, behind
  // the modal.
  let background = location.state && location.state.background;

  /*** API ***/
  React.useEffect(() => {
    // Отправляем экшены при монтировании компонента
    dispatch(getBurgerDataFromServer());
    dispatch(getUser(getCookie('accessToken'), 3));
    if (background) {
      delete location.state.background;
    }
  }, [dispatch, history])

  /*** App Rendering ***/
  if (burgerDataState.hasError) {
    return <h2 className="text text_type_main-default">{burgerDataState.error.message}</h2>;
  } else if (burgerDataState.isLoading) {
    return <div>Загрузка...</div>;
  } else {
    return (
      // <BrowserRouter>
      <div className={main.main}>
        <AppHeader/>
        <main className="pt-10 pb-10">
          <Switch location={background || location}>

            <Route path="/login" exact={true}>
              <AuthorisationPage/>
            </Route>

            <Route path="/register" exact={true}>
              <RegistrationPage/>
            </Route>

            <Route path="/forgot-password" exact={true}>
              <ForgotPasswordPage/>
            </Route>

            <Route path="/reset-password" exact={true}>
              <ResetPasswordPage/>
            </Route>

            <Route path="/feed" exact={true}>
              <FeedPage/>
            </Route>

            <Route path="/feed/:id" exact={true}>
              <OrderDetailsPage orderActions={wsActions} order={ordersFeedState.orders}/>
            </Route>

            <ProtectedRoute path="/profile" exact={true}>
              <AccountPage text="В этом разделе вы можете изменить свои персональные данные">
                <ProfileDetails/>
              </AccountPage>
            </ProtectedRoute>

            <ProtectedRoute path="/profile/orders" exact={true}>
              <AccountPage text="В этом разделе вы можете посмотреть свою историю заказов">
                <MyOrdersPage/>
              </AccountPage>
            </ProtectedRoute>

            <ProtectedRoute path="/profile/orders/:id" exact={true}>
              {
                userOrdersFeedState.orders !== [] &&
                // передаем реализацию интерфейса IWebSocketActions в виде переменной wsActionsSecured,
                // внутри которой нужные функции соотв-ют типам из этого интерфейса
                <OrderDetailsPage orderActions={wsActionsSecured} order={userOrdersFeedState.orders}/>
              }
            </ProtectedRoute>

            <ProtectedRoute path="/profile/logout" exact={true}>
              <AccountPage text="В этом разделе вы можете выйти из системы">
                <LogoutPage/>
              </AccountPage>
            </ProtectedRoute>

            <Route path="/ingredient/:id">
              <IngredientDetailsPage/>
            </Route>

            <Route path="/" exact={true}>
              <BurgerConstructorPage/>
            </Route>

            <Route>
              <NotFound404/>
            </Route>

          </Switch>
          {/*Show the modal when a background page is set */}
          {
            background
            && <Route exact path="/ingredient/:id" children={
              <Modal handleOnClose={() => {
                history.goBack();
              }}>
                <IngredientDetails/>
              </Modal>
            }/>
          }
          {
            background
            && <Route exact path="/feed/:id" children={
              <Modal handleOnClose={() => {
                history.goBack();
              }}>
                <OrderDetails array={ordersFeedState.orders}/>
              </Modal>
            }/>
          }
          {
            background
            && <ProtectedRoute exact path="/profile/orders/:id" children={
              <Modal handleOnClose={() => {
                history.goBack();
              }}>
                <OrderDetails array={userOrdersFeedState.orders}/>
              </Modal>
            }/>
          }
        </main>
      </div>
      // </BrowserRouter>
    );
  }
}

export default App;
