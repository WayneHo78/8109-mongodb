# Queries

## To show all databases
```
show databases
```

## Switch database
```
use name_of_database
```

## Show all collections in a database
```
show collections;
```

## Find documents

### show all documents
Show documents

```
db.listingsAndReviews.find()
```

### Limit the number of documents returned
```
db.listingsAndReviews.find().limit(2)
```

## Projection
It's to specify what keys from the documents do we want.
```
db.listingsAndReviews.find({}, {
    name: 1,
    summary: 1
}).limit(2);
```

```
db.listingsAndReviews.find({}, {
    name: 1,
    beds: 1,
    summary: 1
})
```

## Find documents by criteria

### Find by a single key
```
db.listingsAndReviews.find({
    beds: 2
}, {
    name: 1,
    beds: 1
})
```

### Find by more than one keys
Find all the listings that have exactly two beds, and the property type is "Apartment"
```
db.listingsAndReviews.find({
    beds: 2,
    property_type:"Apartment"
}, {
    name: 1,
    beds: 1,
    property_type: 1
})
```

### Find documents by a key in an object value
```
db.listingsAndReviews.find({
    "address.country":"Hong Kong"
}, {
    name: 1,
    "address.country":1
})
```

### Find documents by a range of number
Find all the listings that have 2 to 4 beds.
```
db.listingsAndReviews.find({
    beds: {
        "$gte": 2,
        "$lte": 4
    }
})
```
Comparison operators in mongo:
* $gte: greater than or equal
* $lte: lesser than or equal
* $gt, $lt: greater than, lesser than
* $eq, $nq: equal, not equal

### Find all listings in Hong Kong that is an Apartment and has between 2 to 4 beds
```
db.listingsAndReviews.find({
    beds: {
        "$gte":2,
        "$lte": 4
    },
    property_type:"House",
    "address.country":"Spain"
}, {
    name: 1,
    beds: 1,
    property_type: 1,
    "address.country": 1
});
```

### Count how many results there are
Count how many listings are there in Hong Kong
```
db.listingsAndReviews.find({
    "address.country":"Hong Kong",
}).count();
```

### Find by element in array
   Find all listings that microwave in its array amenities
   ```
   db.listingsAndReviews.find({
    amenities:"Microwave"
   }, {
    name: 1,
    amenities: 1
   })
   ```

   ### Find by more than 1 element in an array
   Find all listings that have washing machine and dryer
   ```
   db.listingsAndReviews.find({
    amenities:{
        $all:["Washer", "Dryer"]
    }
   }, {
    name: 1,
    amenities: 1
   })
   ```

   ### Find by either/or in array
   Find all listings that have either TV or Cable
   ```
   db.listingsAndReviews.find({
    amenities: {
        $in:["TV", "Cable TV"]
    }
   }, {
    name: 1,
    amenities: 1
   })
   ```

   ### Find by key in an array of objects
   ```
   db.listingsAndReviews.find({
    'reviews':{
        $elemMatch : {
            'reviewer_name':'Davi'
        }
    }
   }, {
    name: 1,
    "reviews.$":1
   })
   ```
   The `$` will refer to the object selected by `$elemMatch`.

### Find by dates
In programming world, we always work with ISO dates. The `YYYY-MM-DD` is the ISO date format.
We use the `ISODate` function to create a new date in Mongo.

Example: find all the listings where their first reviewed date is before 2019
```
db.listingsAndReviews.find({
    first_review: {
        $lte: ISODate("2018-12-30")
    }
}, {
    name: 1,
    first_review: 1
})
```

### Find by string patterns

So if we do keyword search in the fields, then we do need match by string patterns
```
db.listingsAndReviews.find({
    description: {
        $regex:"Spacious",
        $options:"i"
    }
}, {
    name: 1,
    description: 1
})
```

### Find by ObjectId
All Mongo documents will have an `_id` key. It stores the unique ID of the document and it's always better
to use an `ObjectId` to store it.
```
use sample_mflix
db.movies.find({
    _id: ObjectId("573a1391f29313caabcd6d40")
})
```

### Find listings from Brazil or Canada
```
db.listingsAndReviews.find({
    $or:[
            {
                "address.country":"Brazil"
            },
            {
                "address.country":"Canada"
            }
    ]
}, {
    name:1,
    "address.country": 1
})
```

Find all listings from Brazil or Canada.
If in Brazil, we want a house.
If in Canada, we want an aparment
```
db.listingsAndReviews.find({
    $or:[
            {
                "address.country":"Brazil",
                "property_type":"House"
            },
            {
                "address.country":"Canada",
                "property_type":"Apartment",
                "beds":{
                    $gte: 2
                }
            }
    ]
}, {
    name:1,
    "address.country": 1,
    "beds": 1
})
```