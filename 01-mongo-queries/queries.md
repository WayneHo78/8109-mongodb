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