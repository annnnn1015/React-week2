import axios from 'axios'
import { useState } from 'react';


function App() {
  const baseURL = import.meta.env.VITE_BASE_URL;
  const apiPath = import.meta.env.VITE_API_PATH;

  // 要替換狀態（資料）用useState，此處是要改變account的username與password
  const [account, setAccount] = useState({
    username: "example@test.com",
    password: "example"
  })

  // 第五步：取得產品資料(沿用第一週資料)
  const [tempProduct, setTempProduct] = useState({});
  const [products, setProducts] = useState([]);

  // 第一步：取出username與password的值
  const inputChange = function(event){
    // 在input搭配onChange事件，取得帳號密碼欄位中新輸入的值
    // console.log(event.target.value);
    
    // 因為一次只能取得一個input，所以要在input設定name屬性，才能辨識不同的欄位
    // console.log(event.target.name);

    // 以解構方式取得上述value與name屬性(注意event是物件，所以解構時要用{}包住)
    const { value, name } = event.target;

    // 用setAccount更新username與password的值
    // setAccount({
    //   username: "example@test.com",
    //   password: "example"
    // })
    // 用...展開寫法：
    setAccount({
      // 保留原始屬性，避免更新時被覆蓋
      ...account,
      // 動態新增屬性（如果沒有加[]，會變成新增一個name屬性）
      [name]: value
      // 等於：
      // username: "example@test.com",
      // password: "example"
    })
  }

  

  // 第二步：按登入時將前面取出的值串接API
  const handleLogin = (e) => {
    e.preventDefault();
    // 設定環境變數在.env中，可以用import.meta.env.VITE_變數名稱取得
    axios.post(`${baseURL}/v2/admin/signin`,account)
    .then((res) => {
      // 第四步：將token、expires存入cookie
      const { token, expires } = res.data;
      document.cookie = `week2Token=${token}; expires=${new Date(expires)}`;

      // 登入成功時替換登入狀態false-->true，觸發return的判斷，渲染產品頁面
      setIsAuth(true);

      // 取得產品前要將token從cookie中取出放入header中
      axios.defaults.headers.common['Authorization'] = token;

      // 登入成功時呼叫產品資料API
      axios.get(`${baseURL}/v2/api/${apiPath}/admin/products`)
      .then((res) =>{ 
        // 將API取得的res.data.products的資料替換前面設置的products=[]空陣列的資料
        setProducts(res.data.products)
      })
      .catch((err) => {
        alert(`${err.response.data.message}`);
      })
    })
    .catch((err) => {
      alert(`${err.response.data.message}`);
    })
  }

  // 第三步：判斷是否登入，未登入時渲染登入表單，已登入時渲染產品資料頁面
  // - 增加登入狀態替換useState (false為未登入,true為登入)
  const [isAuth, setIsAuth] = useState(false);

  // 第六步：確認登入狀態(在header有放token的話就是已登入)
  // **promise寫法**
  const checkLoginState = () =>{
    axios.post(`${baseURL}/v2/api/user/check`)
    .then((res) => { alert(`已登入`);})
    .catch((err) => {console.error(error);})
  }
  // **async await寫法**
  // const checkLoginState = async() =>{
  //   try{
  //     await axios.post(`${baseURL}/v2/api/user/check`);
  //     alert(`已登入`)
  //   }
  //   catch{
  //     console.error(error)
  //   }
  // }

  // - 用三元運算判斷登入狀態
  return (
    <>
    {/* 要加上空標籤才不會出錯 */}
    {isAuth ? (<div className="container py-5">
      <div className="row">
        <div className="col-6">
          <button onClick={checkLoginState} type="button" className="btn btn-success mb-3">確認是否登入</button>
          <h2>產品列表</h2>
          <table className="table">
            <thead>
              <tr>
                <th scope="col">產品名稱</th>
                <th scope="col">原價</th>
                <th scope="col">售價</th>
                <th scope="col">是否啟用</th>
                <th scope="col">查看細節</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <th scope="row">{product.title}</th>
                  <td>{product.origin_price}</td>
                  <td>{product.price}</td>
                  <td>{product.is_enabled}</td>
                  <td>
                    <button
                      onClick={() => setTempProduct(product)}
                      className="btn btn-primary"
                      type="button"
                    >
                      查看細節
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="col-6">
          <h2>單一產品細節</h2>
          {tempProduct.title ? (
            <div className="card">
              <img
                src={tempProduct.imageUrl}
                className="card-img-top img-fluid"
                alt={tempProduct.title}
              />
              <div className="card-body">
                <h5 className="card-title">
                  {tempProduct.title}
                  <span className="badge text-bg-primary">
                    {tempProduct.category}
                  </span>
                </h5>
                <p className="card-text">商品描述：{tempProduct.description}</p>
                <p className="card-text">商品內容：{tempProduct.content}</p>
                <p className="card-text">
                  <del>{tempProduct.origin_price} 元</del> / {tempProduct.price}{" "}
                  元
                </p>
                <h5 className="card-title">更多圖片：</h5>
                {tempProduct.imagesUrl?.map((image) => (image && (<img key={image} src={image} className="img-fluid" />)))}
              </div>
            </div>
          ) : (
            <p>請選擇一個商品查看</p>
          )}
        </div>
      </div>
    </div> ): 
      (<div className="d-flex flex-column justify-content-center align-items-center vh-100">
      <h1 className="mb-5">請先登入</h1>
      {/* 因為是form格式，較常見的送出表單方法為onSubmit，當表單被送出時觸發*/}
      <form onSubmit={handleLogin} className="d-flex flex-column gap-3">
        <div className="form-floating mb-3">
          {/* onChange事件:當input值改變時觸發函式 */}
          <input value={account.username} onChange={inputChange} name="username" type="email" className="form-control" id="username" placeholder="name@example.com" />
          <label htmlFor="username">Email address</label>
        </div>
        <div className="form-floating">
          <input value={account.password} onChange={inputChange} name="password" type="password" className="form-control" id="password" placeholder="Password" />
          <label htmlFor="password">Password</label>
        </div>
        {/* onClick事件:當button被點擊時觸發函式 */}
        {/* 解除預設submit：要補上type="button" 或是用e.preventDefault()，用e.preventDefault()才可以用enter鍵送出（submit跟click的差異）*/}
        {/* <button onClick={handleLogin} className="btn btn-primary">登入</button> */}
        <button className="btn btn-primary">登入</button>
      </form>
      <p className="mt-5 mb-3 text-muted">&copy; 2024~∞ - 六角學院</p>
    </div>)}
    </>
  )
}

export default App
