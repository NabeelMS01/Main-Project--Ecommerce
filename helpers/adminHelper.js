const { promise, reject } = require("bcrypt/promises");

const async = require("hbs/lib/async");

var db = require("../config/connection");
var collection = require("../config/collections");
const { response } = require("../app");

var ObjectId = require("mongodb").ObjectId;

module.exports = {
  getAllUser: () => {
    return new Promise(async function (resolve, reject) {
      let users = await db
        .get()
        .collection(collection.USER_COLLECTION)
        .find()
        .toArray();
      resolve(users);
    });
  },

  blockUser: (userId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.USER_COLLECTION)
        .updateOne({ _id: ObjectId(userId) }, { $set: { status: false } })
        .then((response) => {
          console.log(response);
          resolve(response);
        });
    });
  },
  unBlockUser: (userId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.USER_COLLECTION)
        .updateOne({ _id: ObjectId(userId) }, { $set: { status: true } })
        .then((response) => {
          console.log(response);
          resolve(response);
        });
    });
  },

  //-----------------add product -------------------------

  addProduct: (product, files) => {
    product.images = files;
    product.price = parseInt(product.price);
    product.mrp = parseInt(product.mrp);
    product.category_id=ObjectId(product.category_id);
    product.sub_category_id=ObjectId(product.sub_category_id)
    product.status = true;
    return new Promise((resolve, reject) => {
      db.get()
        .collection("products")
        .insertOne(product)
        .then((data) => {
          console.log("sdkhjfklhsdakgfhdskfhjkhsdaflkasdlkhashfk");
          console.log(data);
          resolve(data);
        });
    });
  },
  //-----------------all product -------------------------
  getAllProduct: () => {
    return new Promise(async (resolve, reject) => {
      let products = await db
        .get()
        .collection(collection.PRODUCT_COLLECTION)
        .find()
        .toArray();

      resolve(products);
    });
  },

  //-----------------view product -------------------------
  getProductDetails: (id) => {
    console.log(id);
    return new Promise((resolve, reject) => {
     db.get()
        .collection(collection.PRODUCT_COLLECTION)
        .findOne({ _id:ObjectId(id) }).then((data)=>{
          resolve(data)
        });

     
    });
  },

  //-----------------edit product -------------------------
  updateProduct: (proId, proDetails, imgs) => {

    proDetails.price = parseInt(proDetails.price);
    return new Promise(async (resolve, reject) => {
      await db
        .get()
        .collection(collection.PRODUCT_COLLECTION)
        .updateOne(
          { _id: ObjectId(proId)},
          {
            $set: {
              name: proDetails.name,
              category_id: ObjectId(proDetails.category_id),
              sub_category_id:ObjectId(proDetails.sub_category_id),
              mrp: proDetails.mrp,
              price: proDetails.price,
              description: proDetails.description,
              images: imgs,
            },
          },
          {upsert: true}
        )
        .then((response) => {
          resolve(response);
        });
    });
  },
  //-------------------delete product--------------------
  deleteProduct: (id) => {
    return new Promise(async (resolve, reject) => {
      db.get()
        .collection(collection.PRODUCT_COLLECTION)
        .deleteOne({ _id: ObjectId(id) })
        .then((response) => {
          console.log(response);
          resolve(response);
        });
    });
  },

  //----------------------dactivate/activate product----------
  deactivateProduct: (id) => {
    return new Promise(async (resolve, reject) => {
      db.get()
        .collection(collection.PRODUCT_COLLECTION)
        .updateOne({ _id: ObjectId(id) }, { $set: { status: false } })
        .then((response) => {
          console.log(response);
          resolve(response);
        });
    });
  },
  activateProduct: (id) => {
    return new Promise(async (resolve, reject) => {
      await db
        .get()
        .collection(collection.PRODUCT_COLLECTION)
        .updateOne({ _id: ObjectId(id) }, { $set: { status: true } })
        .then((response) => {
          console.log(response);
          resolve(response);
        });
    });
  },

  //---------------category-Management---------------

  addCategory: (category) => {
    
    return new Promise(async (resolve, reject) => {
      category.offer_percent=parseInt(category.offer_percent)
      category.status=  true;
     
      await db
        .get()
        .collection(collection.PRODUCT_CATEGORY)
        .insertOne(category)
        .then((data) => {
          resolve(data);
        });
    });
  },
  addSubCategory: (subCategory) => {

    return new Promise(async (resolve, reject) => {
      subCategory.category_id= await ObjectId(subCategory.category_id)
      await db
        .get()
        .collection(collection.SUB_CATEGORY_COLLECTION)
        .insertOne(subCategory)
        .then((data) => {
          resolve(data);
        });
    });
  },

  getSubCategory:(id)=>{
    return new Promise(async(resolve,reject)=>{
      let subCategory = await db.get().collection(collection.SUB_CATEGORY_COLLECTION).findOne({_id:ObjectId(id)})

    
console.log(subCategory);
      resolve(subCategory)
    })

  },


getAllSubcategory:()=>{
  return new Promise(async(resolve,reject)=>{
    let subCategory=await db.get().collection(collection.SUB_CATEGORY_COLLECTION).find().toArray()
    resolve(subCategory)
  })
},
editSubCategory:(id)=>{
return new db.get().collection(collection.SUB_CATEGORY_COLLECTION)
},


  getAllCategory: () => {
    return new Promise(async (resolve, reject) => {
      var categories = await db
        .get()
        .collection(collection.PRODUCT_CATEGORY)
        .find()
        .toArray();

      resolve(categories);
    });
  },

  getCategory: (id) => {
    return new Promise(async (resolve, reject) => {
      var category = await db
        .get()
        .collection(collection.PRODUCT_CATEGORY)
        .findOne({ _id: ObjectId(id) });

      resolve(category);
    });
  },
  editCategory: (id, category) => {
    return new Promise(async (resolve, reject) => {
      await db
        .get()
        .collection(collection.PRODUCT_CATEGORY)
        .updateOne(
          { _id: ObjectId(id) },
          {
            $set: {
              category_name: category.category_name,
            },
          }
        )
        .then((response) => {
          resolve(response);
        });
    });
  },
  deleteCategory: (id) => {
    return new Promise(async (resolve, reject) => {
      db.get()
        .collection(collection.PRODUCT_CATEGORY)
        .deleteOne({ _id: ObjectId(id) })
        .then((response) => {
          console.log(response);
          resolve(response);
        });
    });
  },
  getAllOrders:()=>{
    return new Promise(async(resolve,reject)=>{
  let  orders =  db.get().collection(collection.ORDER_COLLECTION).find().sort({time:-1}).toArray()

    resolve(orders)
    })
  },
  getOrderDetails:(id)=>{
    return new Promise(async(resolve,response)=>{
     let order =await db.get().collection(collection.ORDER_COLLECTION).find({_id:ObjectId(id)}).toArray()

     resolve(order)
    })

  }






};
