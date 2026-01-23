import { all, fork } from "redux-saga/effects";
import cartSaga from "./cartSaga";

export default function* rootSaga() {
  yield all([fork(cartSaga)]);
}

