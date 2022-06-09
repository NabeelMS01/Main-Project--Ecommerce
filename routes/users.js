const { response } = require("express");
const express = require("express");
const userHelper = require("../helpers/userHelper");
const router = express.Router();
const config = require("../config/otp");
const adminHelper = require("../helpers/adminHelper");
const async = require("hbs/lib/async");
const { route } = require("../app");
const upload = require("../middlewere/multer");
const client = require("twilio")(config.accountSID, config.authToken);

const verifyLogin = (req, res, next) => {
  if (req.session.loggedIn) {
    next();
  } else {
    res.redirect("/login");
  }
};
const loggedInCheck = (req, res, next) => {
  if (!req.session.loggedIn) {
    res.redirect("/");
  }
  next();
};

// -----------------Otp Verification------------------

/* GET users listing. */
router.get("/", async function (req, res, next) {
  let cartCount = 0;
  if (req.session.user) {
    cartCount = await userHelper.getCartCount(req.session.user._id);
    req.session.cartCount = cartCount;
       req.session.userData= await  userHelper.getUserData(req.session.user._id)
  }

  adminHelper.getAllProduct().then((products) => {
      

    adminHelper.getAllCategory().then((category) => {
      req.session.category = category;



      res.render("user/index", {
        userUi: true,
        logedIn: req.session.loggedIn,
        products,
        category: req.session.category,
        cartCount: req.session.cartCount,
      });
    });
  });
});

//login user

router.get("/login", function (req, res, next) {
  if (req.session.loggedIn) {
    res.redirect("/");
  }

  res.render("user/auth/login", { loginErr: req.flash.loginErr });
  req.flash.loginErr = null;
});

router.post("/login", (req, res) => {
  if (req.body.email && req.body.password) {
    userHelper.doLogin(req.body).then((response) => {
      req.session.user = response.user;
 
      if (response.status) {
        userHelper.loginCheck(req.body).then(async(response) => {
          if (response.userstatus) {

  

            req.session.loggedIn = true;
            let user=await userHelper.getPhone(req.body.email)
            // console.log("*********************");
        //      console.log(user.phone);
        //  console.log("******88888888888***************");
        //        let  number=parseInt(user.phone)
        //        req.session.phone=number
         
        //  await   client.verify
        //     .services(config.serviceSID)
        //     .verifications.create({
        //       to: `+91${number}`,
        //       channel: "sms",
        //     })
        //     .then((data) => {
        //       res.render("user/auth/loginOtpVerify", { userUi: false, number });


        //     });

        res.redirect('/')
         

    


           
          } else {
            req.flash.loginErr = "your Account is Blocked";
            res.redirect("/login");
            req.session.loggedIn = false;
          }
        });
      } else {
        req.flash.loginErr = "Invalid credentials";
        res.redirect("/login");
      }
    });
  }
});

// ***************Logout****************

router.get("/logout", (req, res) => {
  req.session.destroy().then(res.redirect("/"));
});

router.get("/signup", function (req, res, next) {
  if (req.session.loggedIn) {
    res.redirect("/");
  } else {
    res.render("user/auth/signup", { signupErr: req.flash.signupError });
    req.flash.signupError = "";
  }
});

router.post("/signup", (req, res) => {
  userHelper.signUpCheck(req.body).then((response) => {
    if (response.status) {
      req.flash.signupError = "Account already exist";

      res.redirect("/signup");
    } else {
      var number = req.body.phone;
      req.session.phone = req.body.phone;
      req.session.userData = req.body;

      // console.log(user.number);
      req.session.loggedin = true
     req.session.user = response.user

      client.verify
        .services(config.serviceSID)
        .verifications.create({
          to: `+91${number}`,
          channel: "sms",
        })
        .then((data) => {

          req.session.number= req.body.phone
          res.redirect("/otp-varify");
          
        });
   
            
    }


  });
});
//------------------------OTP VErification------------------------------
router.get("/otp-varify", (req, res) => {
  res.render("user/auth/otp-verify",{otpErr:req.session.otpErr,number: req.session.number,userUi:false});

});


router.post("/verify-otp-login",  (req, res) => {
  var otp = req.body.otp;
console.log(otp)
console.log("9999999999999999999999999")
  let number = req.session.phone;
  console.log(number) 
  console.log("99999999999955555555555555555555555559999999999999")
  client.verify
    .services(config.serviceSID)
    .verificationChecks.create({
      to: `+91${number}`,
      code: otp,
    })
    .then((data) => {
      if (data.status == "approved") {
        req.session.loggedIn=true;
          res.redirect("/login");
         
       
      } else {
        req.session.otpErr = "Invalid OTP";
        req.session.loggedIn = false;
        res.redirect('/otp-varify');
      }
    });
});





router.post("/verify-otp", (req, res) => {
  var otp = req.body.otp;
console.log(otp)
console.log("9999999999999999999999999")
  let number = req.session.phone;
  console.log(number) 
  console.log("99999999999955555555555555555555555559999999999999")
  client.verify
    .services(config.serviceSID)
    .verificationChecks.create({
      to: `+91${number}`,
      code: otp,
    })
    .then((data) => {
      if (data.status == "approved") {
        userHelper.doSignUp(req.session.userData).then((response) => {
          res.redirect("/login");
         
        });
      } else {
        otpErr = "Invalid OTP";
        req.session.loggedIn = false;
        res.render("user/auth/otp-verify", { otpErr, number });
      }
    });
});

router.get("/verify-otp", function (req, res, next) {
  res.render("user/auth/otp-verify", { admin: true });
});

//----------------Product details------------------------

router.get("/product-details/:id", (req, res) => {
  var id = req.params.id;

  adminHelper.getProductDetails(id).then((product) => {
    // adminHelper.getAllCategory().then((category) => {
    res.render("user/pages/product_details", {
      userUi: true,
      product,
      category: req.session.category,
      cartCount: req.session.cartCount,
    });
    // });
  });
});

//---------------------Cart-----------------------

router.get("/cart", verifyLogin,async (req, res) => {
  // adminHelper.getAllCategory().then((category) => {
  // try{
 let products= await userHelper.getCartProducts(req.session.user._id) 
      let totalAmount = await userHelper.getTotalAmount(req.session.user._id);
      let addresses =await userHelper.getAddress(req.session.user._id);
      req.session.totalAmount = totalAmount;
      res.render("user/pages/cart", {
        userUi: true,
        category: req.session.category,
        products,
        logedIn: req.session.loggedIn,
        cartCount: req.session.cartCount,
        user: req.session.user,
        totalAmount: req.session.totalAmount,
        addresses,

        userData:req.session.userData,
     
        
      });
    







  // let cartProductTotal = await userHelper.getCartProductTotal(req.session.user._id)

  // }catch(e){

  //   res.render("user/pages/cart", {
  //     userUi: true,
  //     category: req.session.category,

  //     logedIn: req.session.loggedIn,

  //     user: req.session.user,

  //   });

  // }

  // });
});

router.get("/add-to-cart/:id", async (req, res) => {
  let uid = req.params.id;
  let userid = req.session.user._id;
  let product = await adminHelper.getProductDetails(uid);

  userHelper.addToCart(uid, userid, product).then(() => {
    res.json({ status: true });
  });
});

//---------------cart product increment decrement------------------

router.post("/change-product-quantity", async (req, res) => {
  console.log(req.body);
  console.log("*----------------------*");

  userHelper.changeProductQuantity(req.body).then(async (response) => {
    response.totalAmount = await userHelper.getTotalAmount(req.body.user);
    response.cartProductTotal = await userHelper.getCartProductTotal(
      req.session.user._id
    );

    // console.log(response);
    console.log(response);
    res.json(response);
  });
});
router.post("/remove-cart-product", (req, res) => {
  userHelper.removeCartProduct(req.body).then((response) => {
    res.json(response);
  });
});

router.post("/add-default-address", (req, res) => {
console.log(req.body);
  userHelper.getDefaultAddress(req.body.addressId).then(async(response) => {

console.log(response);
console.log("***********************");
 
      req.session.selectAddress=  await  response
    res.redirect('/place-order')
  });
});

router.get("/place-order", verifyLogin, async (req, res) => {
  if (!req.session.loggedIn) {
    res.redirect("/");
  }
  let addresses =await userHelper.getAddress(req.session.user._id);

  let totalAmount = await userHelper.getTotalAmount(req.session.user._id);

  res.render("user/pages/checkout", {
    userUi: true,
    category: req.session.category,
    cartCount: req.session.cartCount,
    totalAmount,
    user: req.session.user,
    logedIn: req.session.loggedIn,
    addresses,
    address:req.session.selectAddress,
   
  });

  


});

router.post("/place-order", verifyLogin, async (req, res) => {
  console.log(req.body);
  let products = await userHelper.getCartProducts(req.body.userId);
  let totalPrice = await userHelper.getTotalAmount(req.body.userId);
  

 await userHelper.placeOrder(req.body, products, totalPrice).then((response) => {
    res.json({ status: true });

  });
});

//------------------------user  account ---------------------------
router.get("/account", verifyLogin, async(req, res) => {
    console.log(req.session.userData);
    let userData= await userHelper.getUserData(req.session.user._id)
  res.render("user/pages/profile", {
    userUi: true,
    category: req.session.category,
    cartCount: req.session.cartCount,
    logedIn: req.session.loggedIn,
    userData:userData,
    user: req.session.user,
  });
});



//-----------------addresses-------------------

router.get("/account-addresses",verifyLogin,async(req,res)=>{

 let address=await userHelper.getAddress( req.session.userData._id)
  
 console.log(address)
  res.render("user/pages/account_addresses", {
    userUi: true,
    category: req.session.category,
    cartCount: req.session.cartCount,
    logedIn: req.session.loggedIn,
    userData:req.session.userData,
    user: req.session.user,
    address
  });

})

router.post("/add-address",async(req,res)=>{
 
  console.log(req.session.userData)
let userId=req.session.userData._id

await  userHelper.addNewAddress(req.body,userId).then(
       
  res.json({status:true})
 
 
 )

}),

router.get('/deleteAddress/:id',(req,res)=>{

  console.log(req.params.id);
  console.log("++++++++++++++++++++++");
  userHelper.deleteAddress(req.params.id).then((response)=>{
    res.json({status:true})
  })


}),

router.post('/edit-address/:id',(req,res)=>{
  console.log(req.body);
  console.log(req.params.id);
  console.log("++++++++++++++++++++++");
  userHelper.updateAddress(req.params.id,req.body).then((response)=>{
  
     res.redirect('/account-addresses')
  })


})

,

router.get("/edit-profile", verifyLogin,async (req, res) => {
  console.log(req.session.userData);

  let userData= await userHelper.getUserData(req.session.user._id)


res.render("user/pages/edit-profile", {
  userUi: true,
  category: req.session.category,
  cartCount: req.session.cartCount,
  logedIn: req.session.loggedIn,
  userData:userData,
  user: req.session.user,
});
});



router.post("/edit-profile", upload.array("proImage"), (req, res, next) => {
 
  console.log("ivide***********************");
   console.log(req.files);
  console.log(req.body);
  let proimg = {};

  req.files.forEach(function (files, index, ar) {
    console.log(req.files[index].filename);

    proimg.image =req.files[index].filename;
  });
  console.log(proimg);



  let userId=req.session.userData._id
   console.log(userId)

  userHelper.editProfile(req.body,proimg,userId).then(() => {
    req.session.submit= true
     res.redirect("/account");


  });
});


//---------------account password change--------
router.get('/account-password-change',verifyLogin,async(req,res)=>{

  let userData= await userHelper.getUserData(req.session.user._id)

  res.render('user/pages/changePassword',{userData, userUi:true})

})






router.get("/orders", verifyLogin, async (req, res) => {
  let orders = await userHelper.getOrderByUser(req.session.user);

  console.log(orders);

  res.render("user/pages/allOrders", {
    userUi: true,
    category: req.session.category,
    cartCount: req.session.cartCount,
    logedIn: req.session.loggedIn,
     user: req.session.user,
    orders,
  });
});

router.get('/cancel-order/:id',(req,res)=>{
 
  console.log(req.params.id);
  userHelper.cancelOrder(req.params.id).then(
    res.json({status:true})
  )


});
router.get('/ship-order/:id',(req,res)=>{
 
  console.log(req.params.id);
  userHelper.shipOrder(req.params.id).then(
    res.json({status:true})
  )


})

module.exports = router;
