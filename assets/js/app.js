const cl = console.log;

const title = document.getElementById("title");
const body = document.getElementById("body");
const userId = document.getElementById("userId");
const postsForm = document.getElementById("postsForm");
const addBtn = document.getElementById("addBtn");
const updateBtn = document.getElementById("updateBtn");
const loader = document.getElementById("loader");
const postsContainer = document.getElementById("postsContainer");

let BASE_URL = `https://fetch-generic-function-default-rtdb.asia-southeast1.firebasedatabase.app`;
let POSTS_URL = `${BASE_URL}/posts.json`;


let snackBar = (title, icon) => {
    return Swal.fire({
        title : title,
        icon : icon,
        timer : 2500
    })
}

let makeApiCall = (apiUrl, methodName, msgBody) => {
    msgBody = msgBody ? JSON.stringify(msgBody) : null;
    loader.classList.remove("d-none")
    return fetch(apiUrl, {
        method : methodName,
        body : msgBody,
        headers : {
            "Content-type" : "application/json",
            "Auth" : "Bearer Token from LS"
        }
    })
    .then(res => res.json())
    .catch(err => {
        snackBar("Something Went Wrong !!!", "error")
    })
    .finally(() => {
        loader.classList.add("d-none");
    })
}

const onDelete = (eve) => {
    Swal.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, delete it!"
      }).then((result) => {
        if (result.isConfirmed) {
            let getId = eve.closest(".card").id;
            let DELETE_URL = `${BASE_URL}/posts/${getId}.json`;
            makeApiCall(DELETE_URL, "DELETE")
                .then(res => {
                    eve.closest(".card").remove();
                })
          Swal.fire({
            title: "Deleted!",
            text: "Your file has been deleted.",
            icon: "success"
          });
        }
      });
}

const onEdit = (eve) => {
    let getId = eve.closest(".card").id;
    localStorage.setItem("getId", getId);
    let EDIT_URL = `${BASE_URL}/posts/${getId}.json`;
    makeApiCall(EDIT_URL, "GET")
        .then(res => {
            title.value = res.title;
            body.value = res.body;
            userId.value = res.userId;
            addBtn.classList.add("d-none");
            updateBtn.classList.remove("d-none");
            let getScrollvalue = window.scrollY;
            if(getScrollvalue > 100){
                window.scrollTo({
                    top : 0,
                    behavior : "smooth"
                })
            }
            
        })
}

let result = ``;
const createPostsCards = (arr) => {
    for(let i = 0; i < arr.length; i++){
        result+=`
                    <div class="card mt-3" id="${arr[i].id}">
                        <div class="card-header">
                            <h4>${arr[i].title}</h4>
                        </div>
                        <div class="card-body">
                            <p>${arr[i].body}</p>
                        </div>
                        <div class="card-footer d-flex justify-content-between">
                            <button class="btn btn-primary" onclick="onEdit(this)">Edit</button>
                            <button class="btn btn-danger" onclick="onDelete(this)">Delete</button>
                        </div>
                    </div> 
        `
        postsContainer.innerHTML = result
    }
}

let postsArr = [];

const objToArr = (obj) => {
    for (const key in obj) {
        postsArr.push({...obj[key], id : key})
    }
    return postsArr
}

makeApiCall(POSTS_URL, "GET")
    .then(res=> {
        objToArr(res);
        createPostsCards(postsArr);
    })

const createCard = (obj) => {
    let div = document.createElement('div');
    div.id = obj.id;
    div.className = "card mt-3";
    div.innerHTML = `
                    <div class="card-header">
                        <h4>${obj.title}</h4>
                    </div>
                    <div class="card-body">
                        <p>${obj.body}</p>
                    </div>
                    <div class="card-footer d-flex justify-content-between">
                        <button class="btn btn-primary" onclick="onEdit(this)">Edit</button>
                        <button class="btn btn-danger" onclick="onDelete(this)">Delete</button>
                    </div>
    `
    postsContainer.prepend(div);
    snackBar("A post is Added Successfully !!!", "success");
}

const onSubmitBtnClick = (eve) => {
    eve.preventDefault();
    let obj = {
        title : title.value,
        body : body.value,
        userId : userId.value
    }

    makeApiCall(POSTS_URL, "POST", obj)
        .then(res => {
            obj.id = res.name;
            createCard(obj);
        })
        .finally(() => {
            postsForm.reset();
        })
}

const onUpdateHandler = (eve) => {
    let getId = localStorage.getItem("getId");
    let UPDATE_URL = `${BASE_URL}/posts/${getId}.json`;
    let obj = {
        title : title.value,
        body : body.value,
        userId : userId.value
    }

    makeApiCall(UPDATE_URL, "PATCH", obj)
        .then(res => {
            let card = [...document.getElementById(getId).children];
            card[0].innerHTML = `<h4>${res.title}</h4>`;
            card[1].innerHTML = `<p>${res.body}</p>`
            addBtn.classList.remove("d-none");
            updateBtn.classList.add("d-none");
            snackBar("A post is updated Successfully !!!", "success");
        })
        .finally(() => {
            postsForm.reset();
        })
}


postsForm.addEventListener("submit", onSubmitBtnClick);
updateBtn.addEventListener("click", onUpdateHandler);