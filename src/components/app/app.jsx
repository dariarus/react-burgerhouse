import React from 'react';

import main from './app.module.css';
import ingredientsWrapper from "../burger-ingredients/burger-ingredients.module.css";

import {ingredientTypeRuName, queryBurgerDataUrl} from "../../utils/burger-data.js";

import {BurgerContext, BurgerContextIngredients} from "../services/burger-context.js";

import {AppHeader} from '../app-header/app-header.jsx';
import {BurgerIngredients} from '../burger-ingredients/burger-ingredients.jsx';
import {BurgerConstructor} from '../burger-constructor/burger-constructor.jsx';
import {Modal} from "../modal/modal.jsx";
import {OrderDetails} from "../order-details/order-details.jsx";
import {IngredientDetails} from "../ingredient-details/ingredient-details.jsx";

function App() {

  const [state, setState] = React.useState({
    modalsOpened: {},
    ingredientIdForModal: null,
    selectedIngredients: {
      bun: null,
      ingredients: []
    },
    isLoading: false,
    hasError: false,
    error: '',
    burgerData: []
  });

  /*** API ***/
  function getResponseData(res) {
    if (!res.ok) {
      return Promise.reject(`Ошибка: ${res.status}`);
    }
    return res.json();
  }

  React.useEffect(() => {
    fetch(`${queryBurgerDataUrl}`)
      .then(res => getResponseData(res))
      .then(
        (res) => {
          setState(state => ({
            ...state,
            isLoading: true,
            burgerData: res.data,
          }));
        },
        // Примечание: важно обрабатывать ошибки именно здесь, а не в блоке catch(), чтобы не перехватывать исключения из ошибок в самих компонентах.
        (error) => {
          setState(state => ({
            ...state,
            isLoading: true,
            hasError: true,
            error: error
          }))
        }
      )
  }, [])

  /*** Functions ***/
  const setIngredientIdForModal = (ingredientId) => {
    setState((state) => (
      {
        ...state,
        ingredientIdForModal: ingredientId
      }));
  }

  const calculateTotalPrice = () => {
    const ingredientArrayReducer = (acc, item) => {
      return acc + item.price
    }

    let bunPrice = 0;
    if (state.selectedIngredients.bun) {
      bunPrice = state.selectedIngredients.bun.price * 2;
    }

    let ingredientPrice = state.selectedIngredients.ingredients.reduce(ingredientArrayReducer, 0);
    return ingredientPrice + bunPrice;
  }

  /*** Handlers ***/
  function handleOpenModal(modalToOpen) {
    setState(state => {
      const modalState = {
        ...state
      };
      if (modalToOpen) {
        Object.keys(modalState.modalsOpened).forEach(modal => {
          modalState.modalsOpened[modal] = false;
        })
        modalState.modalsOpened[modalToOpen] = true;
      }
      return modalState;
    })
  }

  function handleCloseModal(modalToClose) {
    setState(state => {
      const modalState = {
        ...state
      };
      if (modalToClose) {
        Object.keys(modalState.modalsOpened).forEach(modal => {
          modalState.modalsOpened[modal] = false;
        })
      }
      return modalState;
    })
    //console.log(state);
  }

  /*** Reducers ***/
  const initTotalIngredientPrice = {
    totalPrice: 0
  };
  const totalIngredientPriceReducer = (stateReducer, action) => {
    switch (action.type) {
      case "recalculateTotalPrice": {
        return {
          ...stateReducer,
          totalPrice: calculateTotalPrice()
        }
      }
      default:
        return stateReducer;
    }
  }
  const [statePrice, dispatchTotalPrice] = React.useReducer(totalIngredientPriceReducer, initTotalIngredientPrice, undefined);

  // const stateIngredientsIdInitial = {
  //   bun: null,
  //   ingredients: []
  // }
  const pushIngredientsReducer = (stateReducer, action) => {
    switch (action.type) {
      case "addIngredientToOrder": {
        if (action.ingredient.type === 'bun') {
          setState((state) => ({
            ...state,
            selectedIngredients: {
              ...state.selectedIngredients,
              bun: action.ingredient
            }
          }));
        } else {
          const copiedSelectedItemsIdIngredients = [
            ...state.selectedIngredients.ingredients
          ];
          copiedSelectedItemsIdIngredients.push(action.ingredient);
          setState((state) => ({
            ...state,
            selectedIngredients: {
              ...state.selectedIngredients,
              ingredients: copiedSelectedItemsIdIngredients
            }
          }));
          // ingredients: stateReducer.selectedItemsId.ingredients.push(state.ingredientIdForModal) // неверно! т.к. состояние тут не иммутабельное,
          // и это попытка внести изменения прямо в исходное состояние вместо его копии. '...stateReducer' - это не копирование на месте, а результат выполнения редьюсера
        }
        return stateReducer;
      }
      case "deleteIngredientFromOrder": {
        console.log(action.index);
        const copiedIngredientArray = [
          ...state.selectedIngredients.ingredients
        ];
        copiedIngredientArray.splice(action.index, 1)
        setState((state) => ({
          ...state,
          selectedIngredients: {
            ...state.selectedIngredients,
            ingredients: copiedIngredientArray
          }
        }));
        return stateReducer;
      }
      default:
        return stateReducer;
    }
  }
  const [stateIngredients, dispatchIngredients] = React.useReducer(pushIngredientsReducer, null, undefined)

  React.useEffect(() => {
    dispatchTotalPrice({
      type: "recalculateTotalPrice"
    })
  }, [state.selectedIngredients])
  // const pushIngredientsReducer = (stateReducer, action) => {
  //   switch (action.type) {
  //     case "addIngredientToOrder": {
  //       if (action.ingredient.type === 'bun') {
  //         return {
  //           ...stateReducer,
  //           bun: action.ingredient
  //         }
  //       } else {
  //         const copiedSelectedItemsIdIngredients = [
  //           ...stateReducer.ingredients
  //         ];
  //         copiedSelectedItemsIdIngredients.push(action.ingredient);
  //         return {
  //           ...stateReducer,
  //           ingredients: copiedSelectedItemsIdIngredients
  //         }
  //         // ingredients: stateReducer.selectedItemsId.ingredients.push(state.ingredientIdForModal) // неверно! т.к. состояние тут не иммутабельное,
  //         // и это попытка внести изменения прямо в исходное состояние вместо его копии. '...stateReducer' - это не копирование на месте, а результат выполнения редьюсера
  //       }
  //     }
  //     case "deleteIngredientFromOrder": {
  //       return {
  //         ...stateReducer,
  //         selectedItemsId: {
  //           ...state.selectedItemsId,
  //           ingredients: state.selectedItemsId.ingredients.push(action.id)
  //         }
  //       }
  //     }
  //     default:
  //       return stateReducer;
  //   }
  // }


  /*** Memo-ed provider values ***/
  const providerValueTotalPrice = React.useMemo(() => ({
    state, statePrice, dispatchTotalPrice
  }), [state, statePrice, dispatchTotalPrice]);

  const providerValueSelectedIngredient = React.useMemo(() => ({
    stateIngredients, dispatchIngredients
  }), [stateIngredients, dispatchIngredients])

  /*** App Rendering ***/
  if (state.hasError) {
    return <div>Ошибка: {state.error.message}</div>;
  } else if (!state.isLoading) {
    return <div>Загрузка...</div>;
  } else {
    return (
      <div className={main.main}>
        <AppHeader/>
        <main className="pt-10 pb-10">
          <h1 className="text text_type_main-large">Соберите бургер</h1>
          <div className={ingredientsWrapper.section}>
            <BurgerContextIngredients.Provider value={providerValueSelectedIngredient}>
              <BurgerContext.Provider value={providerValueTotalPrice}>

                <BurgerIngredients ingredientTypeRuName={ingredientTypeRuName}
                                   handleOnClick={() => {
                                     handleOpenModal("modalIngredientDetailsOpened")
                                   }}
                  //подъем состояния до родительского компонента от дочернего в
                  // виде функции, которая меняет состояние и которая вызывается в доч.комп.:
                                   setIngredientIdForModal={setIngredientIdForModal}
                />


                <BurgerConstructor handleOnClick={() => {
                  handleOpenModal("modalOrderDetailsOpened")
                }}/>

              </BurgerContext.Provider>
            </BurgerContextIngredients.Provider>

            {
              // modalOrderDetailsOpened и modalIngredientDetailsOpened - убраны из глобального state, т.к. запис-ся динамически через handleOpenModal в
              // отдельный объект modalsOpened и впосл-ие берутся из него:
              state.modalsOpened.modalOrderDetailsOpened &&
              <Modal handleOnClose={() => {
                handleCloseModal("modalOrderDetailsOpened")
              }}>
                <OrderDetails/>
              </Modal>
            }

            {
              state.modalsOpened.modalIngredientDetailsOpened &&
              <Modal handleOnClose={() => {
                handleCloseModal("modalIngredientDetailsOpened")
              }}>
                <IngredientDetails ingredientProperties={state.burgerData}
                                   ingredientIdForModal={state.ingredientIdForModal}/>
              </Modal>
            }
          </div>
        </main>
      </div>
    );
  }
}

export default App;
