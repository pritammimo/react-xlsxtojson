import axios from "./Axios";
export const ApiHelperFunction = async (data) => {
  const { urlPath, method, formData } = data;
  var config = {
    method: `${method}`,
    url: `${urlPath}`,
    data: formData,
  };
  let responseData = "";
  await axios(config)
    .then(function (response) {
      responseData = response;
    })
    .catch(function (error) {
      // toast.error(error.message);
      responseData=error?.response;
      }
    );
  return responseData;
};