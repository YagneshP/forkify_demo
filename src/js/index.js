import Search from "./models/Search";
import Receipe from "./models/Recipe";
import List from "./models/List";
import Likes from "./models/Likes";
import * as searchView from "./views/searchView";
import * as recipeView from "./views/recipeView";
import * as listView from "./views/listView";
import * as likeView from "./views/likeView";
import {
    elements,
    renderloader,
    clearLoader
} from "./views/base";

/*Global State of App
 *- Search Object
 *- Current Receipe Object
 *- Shopping list Object
 *- Liked recipe object
 */

const state = {};


/****************
 * Search Controller
 *****************/
const controlSearch = async () => {
    //1) Take query from view(input)
    const query = searchView.getInput();
    if (query) {
        //2) search for the query
        state.search = new Search(query);
        //3)Prepare UI for results
        searchView.clearInput();
        searchView.clearResult();
        renderloader(elements.searchRes);
        try {
            //4)Search for recipe
            await state.search.getResults();
            //5) Render results
            clearLoader();
            searchView.renderResult(state.search.result);
        } catch (err) {
            alert("Something wrong with Searh");
            clearLoader();
        }

    }



}

elements.searchForm.addEventListener("submit", e => {
    e.preventDefault();
    controlSearch();
});



elements.searchResPages.addEventListener("click", e => {
    const btn = e.target.closest(".btn-inline");
    if (btn) {
        const goToPage = parseInt(btn.dataset.goto, 10);
        searchView.clearResult();
        searchView.renderResult(state.search.result, goToPage);


    }
});

/****************
 * Receipe Controller
 *****************/

// const r = new Receipe(47746);
// r.getRecipe();
// console.log(r);

const controlRecipe = async () => {
    //Get id from Url
    const id = window.location.hash.replace("#", "");
    // console.log(id);
    if (id) {
        //Prepare Ui for change
        renderloader(elements.recipe);
        recipeView.clearRecipe();


        // Highlight Selected search item
        if (state.search) {
            searchView.highlightSelected(id);
        }
        //Create new Recipe Object
        state.recipe = new Receipe(id);

        try {
            //Get recipe data and parse ingredients
            await state.recipe.getRecipe();
            state.recipe.parseIngredients();
            //Calcualte servings and time
            state.recipe.calcTime();
            state.recipe.calcServings();
            //Render Recipe
            clearLoader();
            recipeView.renderRecipe(state.recipe,
                state.likes.isLiked(id));
        } catch (err) {
            alert("Error processing recipe!!");
        }

    }
};

["hashchange", "load"].forEach(event => window.addEventListener(event, controlRecipe));

/**************** */
// LIST Controller
/**************** */

const controlList = () => {
    //Create a new list if there is none yet
    if (!state.list) state.list = new List();

    //Add each ingredient to the list
    state.recipe.ingredients.forEach(el => {
        const item = state.list.addItem(el.count, el.unit, el.ingredient);
        listView.renderItem(item);
    })
};

/**************** */
// Like Controller
/**************** */


const controlLike = () => {
    if (!state.likes) {
        state.likes = new Likes();
    }
    const currentID = state.recipe.id;
    // User has not liked the recipe yet
    if (!state.likes.isLiked(currentID)) {
        //Add like to the state
        const newLike = state.likes.addLike(
            currentID,
            state.recipe.title,
            state.recipe.author,
            state.recipe.img
        );
        // Toggle the like button
        likeView.toggleLikeBtn(true);
        //Add like to UI List
        likeView.renderLike(newLike);

    } // User has liked the recipe
    else {
        //Remove like from the state
        state.likes.deleteLike(currentID);
        // Toggle the like button
        likeView.toggleLikeBtn(false);
        //Removelike from UI List
        likeView.deleteLike(currentID);

    }
    likeView.toggleLikeMenu(state.likes.getNumLikes());
}
//Handle delete and Update list item events
elements.shopping.addEventListener("click", e => {
    const id = e.target.closest(".shopping__item").dataset.itemid;

    // Handel the delete event
    if (e.target.matches(".shopping__delete, .shopping__delete *")) {
        //Delete from state
        state.list.deleteItem(id);
        //Delete from UI
        listView.deleteItem(id);
        // Handel update count
    } else if (e.target.matches(".shopping__count-value")) {
        const val = parseFloat(e.target.value, 10);
        state.list.updateCount(id, val);
    }
});
//Restore liked recipe on page load
window.addEventListener("load", () => {
    state.likes = new Likes();
    //Restore Likes
    state.likes.readStorage();
    likeView.toggleLikeMenu(state.likes.getNumLikes());
    // Render the existing like
    state.likes.likes.forEach(like => likeView.renderLike(like));
});



// Handling Recipe Button

elements.recipe.addEventListener("click", e => {
    if (e.target.matches(".btn-decrease,.btn-decrease *")) {
        // Decrease button clicked
        if (state.recipe.servings > 1) {
            state.recipe.updateServings("dec");
            recipeView.updateServingIngredient(state.recipe);
        }
    } else if (e.target.matches(".btn-increase, .btn-increase *")) {
        //Increase button clicked
        state.recipe.updateServings("inc");
        recipeView.updateServingIngredient(state.recipe);
    } else if (e.target.matches(".recipe__btn--add, .recipe__btn--add *")) {
        //Add ingredients to shopping list
        controlList();
    } else if (e.target.matches(".recipe__love, .recipe__love *")) {
        // Like Controller
        controlLike();
    }


});