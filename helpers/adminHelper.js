const { promise, reject } = require("bcrypt/promises");

const async = require("hbs/lib/async");

var db = require("../config/connection");
var collection = require("../config/collections");
const { response } = require("../app");
let moment = require("moment");
const { ObjectID } = require("bson");

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
    product.sub_category_id = ObjectId(product.sub_category_id);
    product.status = true;
    product.offer = 0;
    product.offer_start = null;
    product.offer_end = null;
    product.offer_status = false;
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
        .findOne({ _id: ObjectId(id) })
        .then((data) => {
          resolve(data);
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
          { _id: ObjectId(proId) },
          {
            $set: {
              name: proDetails.name,
              category_name: proDetails.category_name,
              sub_category_id: ObjectId(proDetails.sub_category_id),
              mrp: proDetails.mrp,
              price: proDetails.price,
              description: proDetails.description,
              images: imgs,
            },
          },
          { upsert: true }
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
      category.offer_status = false;
      category.status = true;

      await db
        .get()
        .collection(collection.PRODUCT_CATEGORY)
        .insertOne(category)
        .then((data) => {
          resolve(data);
        });
    });
  },

  // getProductByCategory:(category)=>{
  //   return new Promise(async(resolve,reject)=>{

  //   })

  // },

  addSubCategory: (subCategory) => {
    return new Promise(async (resolve, reject) => {
      subCategory.category_id = await ObjectId(subCategory.category_id);
      await db
        .get()
        .collection(collection.SUB_CATEGORY_COLLECTION)
        .insertOne(subCategory)
        .then((data) => {
          resolve(data);
        });
    });
  },

  getSubCategory: (id) => {
    return new Promise(async (resolve, reject) => {
      let subCategory = await db
        .get()
        .collection(collection.SUB_CATEGORY_COLLECTION)
        .findOne({ _id: ObjectId(id) });

      console.log(subCategory);
      resolve(subCategory);
    });
  },

  getAllSubcategory: () => {
    return new Promise(async (resolve, reject) => {
      let subCategory = await db
        .get()
        .collection(collection.SUB_CATEGORY_COLLECTION)
        .find()
        .toArray();
      resolve(subCategory);
    });
  },
  editSubCategory: (id) => {
    return new db.get().collection(collection.SUB_CATEGORY_COLLECTION);
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
  getAllOrders: () => {
    return new Promise(async (resolve, reject) => {
      let orders = db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .find()
        .sort({ time: -1 })
        .toArray();

      resolve(orders);
    });
  },
  getOrderDetails: (id) => {
    return new Promise(async (resolve, response) => {
      let order = await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .find({ _id: ObjectId(id) })
        .toArray();

      resolve(order);
    });
  },
  //--------------------sales report---------------------

  getSalesDay: () => {
    return new Promise(async (resolve, reject) => {
      let days = await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .aggregate([
          {
            $group: {
              _id: {
                day: {
                  $dayOfWeek: "$order_time",
                },
              },
              TotalSum: {
                $sum: "$totalAmount",
              },
            },
          },
        ])
        .sort({ "_id.day": 1 })
        .toArray();
      console.log(days);
      resolve(days);
    });
  },
  getTotalRevenue: () => {
    return new Promise(async (resolve, reject) => {
      totalRevenue = await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .aggregate([
          {
            $group: {
              _id: 0,
              total: {
                $sum: "$totalAmount",
              },
            },
          },
        ])
        .toArray();

      resolve(totalRevenue[0].total);
    });
  },
  getCardSale: () => {
    return new Promise(async (resolve, reject) => {
      totalRevenue = await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .aggregate([
          {
            $match: {
              paymentMethod: "razorpay",
            },
          },
          {
            $group: {
              _id: 0,
              total: {
                $sum: "$totalAmount",
              },
            },
          },
        ])
        .toArray();
      // console.log(totalRevenue[0].total);
      // resolve(totalRevenue[0].total);

      if (totalRevenue[0] === undefined) {
        resolve();
      } else {
        resolve(totalRevenue[0].total);
      }
    });
  },

  getPaypalSale: () => {
    return new Promise(async (resolve, reject) => {
      totalRevenue = await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .aggregate([
          {
            $match: {
              paymentMethod: "paypal",
            },
          },
          {
            $group: {
              _id: 0,
              total: {
                $sum: "$totalAmount",
              },
            },
          },
        ])
        .toArray();

      if (totalRevenue[0] === undefined) {
        resolve();
      } else {
        resolve(totalRevenue[0].total);
      }
    });
  },
  //-------------------------------get cod sale report------------------
  getCodSale: () => {
    return new Promise(async (resolve, reject) => {
      totalRevenue = await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .aggregate([
          {
            $match: {
              paymentMethod: "cod",
            },
          },
          {
            $group: {
              _id: 0,
              total: {
                $sum: "$totalAmount",
              },
            },
          },
        ])
        .toArray();
      console.log(totalRevenue[0].total);
      resolve(totalRevenue[0].total);
    });
  },
  //------------------------add product pffer------------------------
  addProductOffer: (id, data, product) => {
    let price = parseInt(product.price);
    data.offer_price = price - (price * data.offer) / 100;

    return new Promise(async (resolve, reject) => {
      data.offer = parseInt(data.offer);
      data.offer_start = moment().toDate();
      data.offer_end = new Date(data.offer_end);
      data.offer_status = true;
      data.offer_price = parseInt(data.offer_price);
      console.log(data);

      await db
        .get()
        .collection(collection.PRODUCT_COLLECTION)
        .updateOne(
          { _id: ObjectId(id) },
          {
            $set: {
              offer: data.offer,
              offer_start: data.offer_start,
              offer_end: data.offer_end,
              offer_status: data.offer_status,
              offer_price: data.offer_price,
            },
          },
          {
            upsert: true,
          }
        );
      resolve();
    });
  },
  //-------------------------remove product offer ----------------------
  removeProductOffer: (id) => {
    return new Promise(async (resolve, reject) => {
      await db
        .get()
        .collection(collection.PRODUCT_COLLECTION)
        .updateOne(
          { _id: ObjectId(id) },
          {
            $set: {
              offer: parseInt(0),
              offer_start: null,
              offer_end: null,
              offer_status: false,
              offer_price: null,
            },
          },
          {
            upsert: true,
          }
        );

      resolve();
    });
  },
  //------------------add category offer----------------------
  addCategoryOffer: (id, data) => {
    return new Promise(async (resolve, reject) => {
      data.offer = parseInt(data.offer);
      data.offer_start = moment().toDate();
      data.offer_end = new Date(data.offer_end);
      data.offer_status = true;

      console.log(data);

      await db
        .get()
        .collection(collection.PRODUCT_CATEGORY)
        .updateOne(
          { _id: ObjectId(id) },
          {
            $set: {
              offer: data.offer,
              offer_start: data.offer_start,
              offer_end: data.offer_end,
              offer_status: data.offer_status,
            },
          },
          {
            upsert: true,
          }
        );
      let category = await db
        .get()
        .collection(collection.PRODUCT_CATEGORY)
        .findOne({ _id: ObjectId(id) });
      let products = await db
        .get()
        .collection(collection.PRODUCT_COLLECTION)
        .aggregate([
          {
            $match: {
              category_name: category.category_name,
            },
          },
        ])
        .toArray();

      await products.map(async (product) => {
        let price = product.price;
        console.log(price);
        let offer_price = price - (price * data.offer) / 100;
        await db
          .get()
          .collection(collection.PRODUCT_COLLECTION)
          .updateOne(
            { _id: ObjectId(product._id) },
            {
              $set: {
                offer: data.offer,
                offer_price: parseInt(offer_price),
                offer_start: data.offer_start,
                offer_end: data.offer_end,
                offer_status: data.offer_status,
              },
            }
          );
      });

      console.log(products);

      resolve();
    });
  },
  //-------------------remove category offer--------------------------
  removeCategoryOffer: (id) => {
    return new Promise(async (resolve, reject) => {
      console.log(id);
      let categ = await db
        .get()
        .collection(collection.PRODUCT_CATEGORY)
        .updateOne(
          { _id: ObjectId(id) },
          {
            $set: {
              offer: parseInt(0),
              offer_start: null,
              offer_end: null,
              offer_status: false,
            },
          },
          {
            upsert: true,
          }
        );
      let category = await db
        .get()
        .collection(collection.PRODUCT_CATEGORY)
        .findOne({ _id: ObjectId(id) });
      let products = await db
        .get()
        .collection(collection.PRODUCT_COLLECTION)
        .aggregate([
          {
            $match: { category_name: category.category_name },
          },
        ])
        .toArray();

      await products.map(async (product) => {
        await db
          .get()
          .collection(collection.PRODUCT_COLLECTION)
          .updateOne(
            {
              _id: product._id,
            },
            {
              $set: {
                offer: 0,
                offer_price: null,
                offer_start: null,
                offer_end: null,
                offer_status: false,
              },
            }
          );
      });

      resolve();
    });
  },

  addCouponCode: (data) => {
    return new Promise(async (resolve, reject) => {
      data.offer = parseInt(data.offer);
      await db
        .get()
        .collection(collection.COUPON_COLLECTION)
        .insertOne({
          coupon_code: data.coupon_code,
          offer: data.offer,
          status: true,
        })
        .then(() => {
          resolve();
        });
    });
  },
  removeCouponCode: (id) => {
    return new Promise(async (resolve, reject) => {
      await db
        .get()
        .collection(collection.COUPON_COLLECTION)
        .deleteOne({ _id: ObjectId(id) })
        .then((response) => {
          resolve();
        });
    });
  },
  getAllCoupons: () => {
    return new Promise(async (resolve, reject) => {
      let products = await db
        .get()
        .collection(collection.COUPON_COLLECTION)
        .find()
        .toArray();
      resolve(products);
    });
  },
  //----------------------Banner Management---------------

  addBanner: (banner, files) => {
    return new Promise(async (resolve, reject) => {
      banner.image = files;
      banner.status=true
      banner.sub_category_id = ObjectId(banner.sub_category_id);

      console.log(banner);

      await db
        .get()
        .collection(collection.BANNER_COLLECTION)
        .insertOne(banner)
        .then((response) => {
          resolve();
        });
    });
  },

  getAllBanners:()=>{
return new Promise(async(resolve,reject)=>{

  let banners=await db.get().collection(collection.BANNER_COLLECTION).find().toArray()
  resolve(banners)


})



  },
  deleteBanner:(id)=>{
    return new Promise(async(resolve,reject)=>{

await db.get().collection(collection.BANNER_COLLECTION).deleteOne({_id:ObjectId(id)}).then((response)=>{
    resolve()
})

    })
  }


};
