// Budget Controller 
var budgetController = (function(){
    var Expense = function(id,desc,value){
        this.id  = id;
        this.desc = desc;
        this.value = value;
    }
    var Income = function(id,desc,value){
        this.id  = id;
        this.desc = desc;
        this.value = value;
    }
    var calculateTotal = function(type){
         var sum = 0;
        data.allItems[type].forEach(function(curr){
            sum += curr.value;
        });
        data.totals[type] = sum;
    };
    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals:{
            exp:0,
            inc:0
        },
        budget : 0,
        percent : -1
    };
    return {
        addItem: function(type,description,value){
            var newItem,ID;

            if(data.allItems[type].length > 0){
                //find out ID
                ID = data.allItems[type][data.allItems[type] .length - 1].id + 1;
            }
            else{
                ID = 0;
            }
            //find out type and create new item in that type array
            if(type === 'exp'){
                newItem = new Expense(ID,description,value);
            }else if(type === 'inc'){
                newItem = new Income(ID,description,value);
            }
            //push all items in array--
            data.allItems[type].push(newItem);
            //return new element
            return newItem;
        },
        deleteItem : function(type,id){
            // id = [1 2 4 6 9]
            var ids,index;
                ids = data.allItems[type].map(function(current){
                    return current.id;
            });
            index = ids.indexOf(id);

            if(index !== -1){
                data.allItems[type].splice(index , 1);
            }
        },
        calculateBudget : function(){
            // calculate total inc and exp

            calculateTotal('inc');
            calculateTotal('exp');

            // calculate budget : inc - exp
            data.budget = data.totals.inc - data.totals.exp;
            // calculate percentag of  inc that is spent

            if(data.totals.inc > 0){
                data.percent = Math.round((data.totals.exp / data.totals.inc * 100)) + '%';
            }
            else{
                data.percent = '--';
            }
        },
        getbudget : function(){
            return {
                budget: data.budget,
                totalInc : data.totals.inc,
                totalExp : data.totals.exp,
                percent: data.percent
            }
        },

        testing : function(){
            console.log(data)
        }
    };

})();

//UI controller
var UIController = (function(){

    var DomStrings = {
        inputType : '.add__type',
        inputDescription : '.add__description' ,
        inputValue : '.add__value',
        inputBtn :'.add__btn',
        incContainer:'.income__list',
        expContainer:'.expenses__list',
        budgetLabel : '.budget__value',
        incLabel : '.budget__income--value',
        expLabel : '.budget__expenses--value',
        percentlabel : '.budget__expenses--percentage',
        container:'.container',
        label : '.item'
    };

    return {
    getInput : function(){
        return  {
    
        type : document.querySelector(DomStrings.inputType).value,
        description :  document.querySelector(DomStrings.inputDescription).value,
        value : parseFloat(document.querySelector(DomStrings.inputValue).value)   
        };
    },

    // Adding new item to UI

    itemList : function(obj , type){

        var html,newHtml, element;
        // Create placeholder html

        if(type === 'inc'){
             element = DomStrings.incContainer;
            html = `<div class="item clearfix" id="inc-%id%"> <div class="item__description">%description%</div> <div class="right clearfix"> <div class="item__value"><span>&#8377</span>%value%</div> <div class="item__delete"> <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>`;
        }
        else if(type === 'exp'){
            element = DomStrings.expContainer;
            html = `<div class="item clearfix" id="exp-%id%"> <div class="item__description">%description%</div> <div class="right clearfix"> <div class="item__value"><span>&#8377</span>%value%</div> <div class="item__percentage">21%</div> <div class="item__delete"> <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>`;
        }
        // Replace placeholder with actual data

        newHtml = html.replace('%id%', obj.id);
        newHtml = newHtml.replace('%description%' , obj.desc);
        newHtml = newHtml.replace('%value%' , obj.value);

        // Display data in Ui
        document.querySelector(element).insertAdjacentHTML('beforeend' , newHtml);

    },

    // clear input fields

    clearField: function(){
        var fields,fieldsArr;
        fields = document.querySelectorAll(DomStrings.inputDescription + ',' + DomStrings.inputValue);

        fieldsArr = Array.prototype.slice.call(fields);

        fieldsArr.forEach(function(current , index , array){
            current.value = "";

        });
    },

    displayBudget : function(obj){
        
        document.querySelector(DomStrings.budgetLabel).innerHTML = '&#8377;' + obj.budget;
        document.querySelector(DomStrings.incLabel).innerHTML = '&#8377;' + obj.totalInc;
        document.querySelector(DomStrings.expLabel).innerHTML = '&#8377;' + obj.totalExp;
        document.querySelector(DomStrings.percentlabel).textContent = obj.percent;
    },

    removeItem : function(selectorID){
        var el = document.getElementById(selectorID);
        el.parentNode.removeChild(el);

    },
    getDomStrings: function(){
        return DomStrings;
    } 
};

})();

//App controller

var AppController = (function(budgtCtrl , uiCtrl){

    var DOM = uiCtrl.getDomStrings();
    var setUpEventListeners = function () {
        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);

        document.addEventListener('keypress' , function(e){
            
            if(e.keyCode === 13){
                ctrlAddItem();
            }
        });
    document.querySelector(DOM.container).addEventListener('click' , ctrlDelItem);
    };

    var updateBudget = function(){
        
        // 5. Calculate Budget
        budgtCtrl.calculateBudget();

        // gete the budget

        var budget = budgtCtrl.getbudget();

        //6. Display Budget in UI

        uiCtrl.displayBudget(budget);
    }
    var ctrlAddItem = function(){
        // 1. Get input data

        var input,newItem;
        input = uiCtrl.getInput();

        if(input.description != "" && !isNaN(input.value) && input.description != 0){
            // 2. Add item to budget controller

        newItem = budgtCtrl.addItem(input.type, input.description, input.value);
        // 3. Add item to UI

        uiCtrl.itemList(newItem , input.type);

        //4 clear input fields
        uiCtrl.clearField();

        // 5. update and call update budget

        updateBudget();
        }
    };

        var ctrlDelItem = function(event){
            var itemId, splitId,type,ID;

            itemId = event.target.parentNode.parentNode.parentNode.parentNode.id;
            console.log(itemId)
            if(itemId){
                splitId = itemId.split('-');
                type = splitId[0];
                ID = parseInt(splitId[1]);

                // delete item from database

                budgtCtrl.deleteItem(type,ID);

                // delete item from Ui
                uiCtrl.removeItem(itemId);

                // update budget
                updateBudget();
            }
        };
        return {
            init: function(){
            setUpEventListeners();
            }
        };

})(budgetController , UIController);

AppController.init();