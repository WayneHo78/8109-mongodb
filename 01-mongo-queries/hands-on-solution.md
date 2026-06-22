1. From the *movies* collection
    1. Count how many movies there are
    `db.movies.find().count()`
    2. Count how many movies there are released before the year 2000
    `db.movies.find({year:{
        $lt: 2000
    }}).count()`
    3. Show the first ten titles of movies produced in the USA
    `
    db.movies.find({
        'countries':"USA"
    }).limit(10)`
    4. Show the first ten titles of movies not produced in the USA
   `
   db.movies.find({
    'countries': {
        $nin:["USA"]
    }
   }).count()
   `

   