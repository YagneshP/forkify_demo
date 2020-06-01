import axios from "axios";

export default class Recipe {
    constructor(id) {
        this.id = id;
    }
    async getRecipe() {
        try {
            const res = await axios(`https://forkify-api.herokuapp.com/api/get?rId=${this.id}`);
            const resData = res.data.recipe;
            this.title = resData.title;
            this.author = resData.publisher;
            this.img = resData.image_url;
            this.url = resData.source_url;
            this.ingredients = resData.ingredients;
        } catch (error) {
            console.log(error);
            alert("Something went wrong :( ");
        }
    }
    calcTime() {
        //Assuming we take 15 mins for 3 ingredients
        const numIng = this.ingredients.length;
        const periods = Math.ceil(numIng / 3);
        this.time = periods * 15;
    }

    calcServings() {
        this.servings = 4;
    }

    parseIngredients() {
        const unitLong = ["tablespoons", "tablespoon", "ounces", "ounce", "teaspoons", "teaspoon", "cups", "pounds"];
        const unitShort = ["tbsp", "tbsp", "oz", "oz", "tsp", "tsp", "cup", "pound", "kg", "g"];
        const newIngredients = this.ingredients.map(el => {
            // 1) Uniform units
            let ingredient = el.toLowerCase();
            unitLong.forEach((unit, i) => {
                ingredient = ingredient.replace(unit, unitShort[i]);
            })
            // 2) Remove parentheses
            ingredient = ingredient.replace(/ *\([^)]*\) */g, " ");;
            // 3) Parse ingredients in to count, unit and ingredients
            const arrIng = ingredient.split(" ");
            const unitIndex = arrIng.findIndex(el2 => unitShort.includes(el2))
            let objIng
            if (unitIndex > -1) {
                // There is a Unit
                // Ex. 4 1/2 cups arrCount = [4, 1/2]
                // ex. 4 cup arrCount =[4]
                const arrCount = arrIng.slice(0, unitIndex);
                let count;
                if (arrCount === 1) {
                    count = eval(arrIng[0].replace("-", "+"));
                } else {
                    count = eval(arrIng.slice(0, unitIndex).join("+"));
                }
                objIng = {
                    count,
                    unit: arrIng[unitIndex],
                    ingredient: arrIng.slice(unitIndex + 1).join(" ")
                }
            } else if (parseInt(arrIng[0], 10)) {
                // There is No Unit but there is a number at first place
                objIng = {
                    count: parseInt(arrIng[0], 10),
                    unit: "",
                    ingredient: arrIng.slice(1).join(" ")
                }
            } else if (unitIndex === -1) {
                // There is no Unit or Number
                objIng = {
                    count: 1,
                    unit: "",
                    ingredient
                }
            }
            return objIng;

        });
        this.ingredients = newIngredients;
    }

    updateServings(type) {
        //Update servings
        const newServings = type === "dec" ? this.servings - 1 : this.servings + 1;
        //Update ingredients
        this.ingredients.forEach(ing => {
            ing.count *= (newServings / this.servings);
        });

        this.servings = newServings;
    }

};