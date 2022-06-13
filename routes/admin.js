const express = require("express");
const req = require("express/lib/request");
const { response } = require("../app");
const adminHelper = require("../helpers/adminHelper");

const router = express.Router();
const controller = require("../controller/controller");
const upload = require("../middlewere/multer");
const async = require("hbs/lib/async");
const { Db } = require("mongodb");

let admin = {
  email: "admin@gmail.com",
  password: "12345",
};
const varifyLogin = (req, res, next) => {
  if (req.session.admin) {
    next();
  } else {
    res.redirect("/admin/login");
  }
};

// -----------------Getting admin home page------------------

router.get("/", (req, res) => {
  if (!req.session.admin) {
    res.redirect("/admin/login");
  } else {
    res.render("admin/pages/home-admin", { admin: true });
  }

  // res.render('admin/login',{admin:true})
});

router.get("/login", (req, res) => {
  if (req.session.admin) {
    res.redirect("/admin");
  }

  res.render("admin/pages/authentication/login", {
    admin: true,
    adminlgnErr: req.flash("message"),
  });

  req.flash("message", null);
});

router.get("/logout", (req, res) => {
  req.session.destroy().then(res.redirect("/admin"));
});

router.post("/login", (req, res) => {
  if (req.body.email != admin.email) {
    req.flash("message", "invalid email");

    res.redirect("/admin/login");
  } else if (req.body.password != admin.password) {
    req.flash("message", "invalid email");

    res.redirect("/admin/login");
  } else if (
    req.body.email != admin.email &&
    req.body.password != admin.password
  ) {
    req.flash("message", "invalid email and password");

    res.redirect("/admin/login");
  } else {
    req.session.admin = true;
    res.redirect("/admin");
  }
});

// ----------------Order Management----------------

router.get("/all-orders",varifyLogin, async (req, res) => {
  let orders = await adminHelper.getAllOrders();


  console.log(orders);
  res.render("admin/pages/orderManagement/orders-admin", {
    admin: true,
    orders,
  });
});

router.get("/order-details/:id",varifyLogin, async (req, res) => {
  let order = await adminHelper.getOrderDetails(req.params.id);


  console.log(order);
  res.render("admin/pages/orderManagement/order-details", {
    admin: true,
    order,
  });
});



// ----------------User Management----------------

router.get("/all-users",varifyLogin, (req, res) => {
  adminHelper.getAllUser().then((users) => {
    res.render("admin/pages/userManagement/all-users", {
      admin: true,
      users,
      toast: req.flash("message"),
    });
  });
});

router.get("/block-user/:id", (req, res) => {
  userId = req.params.id;
  adminHelper.blockUser(userId).then((response) => {

    res.json({ status: true });
  
  });
});

router.get("/unblock-user/:id", (req, res) => {




  userId = req.params.id;

  adminHelper.unBlockUser(userId).then((response) => {
    res.json({ status: true });

  });
});

// ----------------Product Management----------------

// ----------------All product----------------
router.get("/all-products",varifyLogin, (req, res) => {
  adminHelper.getAllProduct().then((products) => {
    res.render("admin/pages/productManagement/all-products", {
      admin: true,
      products,
 
      submit: req.session.submit,
    });
    req.session.submit=false;
    req.flash("message", null);
  });
});

// ----------------Add product----------------
router.get("/add-product",varifyLogin,async (req, res) => {

  let category= await adminHelper.getAllCategory()
  let subcategory= await adminHelper.getAllSubcategory()


  res.render("admin/pages/productManagement/add-product", { admin: true,submit:req.session.submit,category,subcategory })


    req.session.submit=false

 


});

router.post("/add-product", upload.array("multiImages"), (req, res, next) => {
 
  console.log("ivide***********************");
  console.log(req.file);
  console.log(req.body);
  let arr = [];

  req.files.forEach(function (files, index, ar) {
    console.log(req.files[index].filename);

    arr.push(req.files[index].filename);
  });



  adminHelper.addProduct(req.body, arr).then((data) => {
    req.session.submit= true
     res.redirect("/admin/add-product");


  });
});

// ----------------view - product ----------------

router.get("/view-product/:id",varifyLogin, (req, res) => { 
  var id = req.params.id;

adminHelper.getProductDetails(id).then((product)=>{
  res.render("admin/pages/productManagement/view-product.hbs", {
    admin: true,
    toast: req.flash("message"),
    product,
  });

});


});

// ----------------edit - product ----------------

router.get("/edit-product/:id", async(req, res) => {
  //   var id= req.params.id

  //   adminHelper.editProduct(id).then(

    let category= await adminHelper.getAllCategory()
    let subcategory= await adminHelper.getAllSubcategory()
  //   )
  var id = req.params.id;

  adminHelper.getProductDetails(id).then((product) => {
    console.log(product.name);

    res.render("admin/pages/productManagement/edit-product.hbs", {
      admin: true,
      product,
      category,
      subcategory
    });

    req.session.submit=false

  });
});

router.post("/edit-product/:id", upload.array("multiImages"), (req, res) => {
  var id = req.params.id;

  console.log("ivide***********************");
  console.log(req.files);
  console.log(req.body);
  let arr = [];

  req.files.forEach(function (files, index, ar) {
    console.log(req.files[index].filename);

    arr.push(req.files[index].filename);
  });

  adminHelper
    .updateProduct(id, req.body, arr)
    .then(
      req.session.submit="your edit is succesfull",
      res.redirect("/admin/all-products")
    );
});

router.get("/delete-product/:id", (req, res) => {
  id = req.params.id;
  adminHelper.deleteProduct(id).then((response) => {
    res.json({ status: true });
  });
});
//-------------------deactivate/activate product---------------

router.get("/deactivate-product/:id", (req, res) => {
  id = req.params.id;
  adminHelper.deactivateProduct(id).then((response) => {
    res.redirect("/admin/all-products");
  });
});
router.get("/activate-product/:id", (req, res) => {
  id = req.params.id;
  adminHelper.activateProduct(id).then((response) => {
    res.redirect("/admin/all-products");
  });
});

// ----------------Category Management----------------

router.get("/view-category", (req, res) => {
  adminHelper.getAllCategory().then(async(categories) => {
    let subCategory=await adminHelper.getAllSubcategory()
    console.log(subCategory );
    console.log("//////////////////88888888888888" );
    res.render("admin/pages/categoryManagement/view-category", {
      admin: true,
      categories,
      subCategory
    });
  });
});
//---------------add-category------------------------

router.get("/add-category", async(req, res) => {
  let category= await adminHelper.getAllCategory()


  res.render("admin/pages/categoryManagement/add-category", { admin: true ,category});
});

router.post("/add-category", (req, res) => {
  adminHelper.addCategory(req.body).then((data) => {
    res.redirect("/admin/add-category");
  });
});

router.post("/add-subcategory", (req, res) => {
  adminHelper.addSubCategory(req.body).then((data) => {
    res.redirect("/admin/add-category");
  });
});






//---------------edit-category------------------------
router.get("/edit-subCategory/:id", async(req, res) => {
  console.log("******************");
  console.log(req.params.id);
  console.log("******************");

let subCategory= await adminHelper.getSubCategory(req.params.id)

  res.render("admin/pages/categoryManagement/edit-subCategory",{
    admin: true,
    subCategory,
  });
});

router.post("/edit-subCategory/:id", async(req, res) => {
  console.log("******************");
  console.log(req.params.id);
  console.log("******************");

  await  adminHelper.editSubCategory(req.params.id).then()

  res.render("admin/pages/categoryManagement/edit-subCategory", {
    admin: true,
    subCategory,
  });
});






router.get("/edit-category/:id", (req, res) => {
  adminHelper.getCategory(req.params.id).then((category) => {
    res.render("admin/pages/categoryManagement/edit-category", {
      admin: true,
      category,
    });
  });
});

router.post("/edit-category/:id", (req, res) => {
  var id = req.params.id;
  console.log("******************");
  console.log(req.body);
  adminHelper.editCategory(id, req.body).then((response) => {
    res.redirect("/admin/view-category");
  });
});

router.get("/delete-category/:id", (req, res) => {
  var id = req.params.id;
  console.log("******************");
  console.log(req.body);
  adminHelper.deleteCategory(id).then((response) => {
    res.redirect("/admin/view-category");
  });
});

module.exports = router;
