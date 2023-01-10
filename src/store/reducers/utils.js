import { logout } from "./auth";
import { showBanner, clearBanner } from "./banner";


export const handleError = (dispatch, error) => {
  if (error.response) {
    const response = error.response;
    if (response.status === 500) {
      dispatch(showBanner("Error", "Internal Server Error!"));
    } else if (response.status >= 400 && response.status < 500) {
      if (response.status === 401) {
        dispatch(logout())
      }
      const data = response.data;
      if (typeof data.detail === "string" || data.detail instanceof String) {
        dispatch(showBanner("Error", data.detail));
      } else if (Array.isArray(data.detail)) {
        dispatch(showBanner(data.detail[0].type, data.detail[0].msg));
      } else {
        dispatch(showBanner("Error", JSON.stringify(response)));
      }
    } else {
      dispatch(showBanner("Error", JSON.stringify(response))
      );
    }
  } else {
    dispatch(showBanner("Error", error.toString())
    );
  }
};
