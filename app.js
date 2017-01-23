var budgetController = (function() {
	var Income = function(id, description, value) {
		this.id = id;
		this.description = description;
		this.value = value;
	};

	var Expenses = function(id, description, value) {
		this.id = id;
		this.description = description;
		this.value = value;
	};

	var calculateTotal = function(type) {
		var sum = 0;

		data.allItems[type].forEach(function(element) {
			sum += element.value;
		});

		data.total[type] = sum; 
	};

	var data = {
		allItems: {
			exp: [],
			inc: []
		},
		total: {
			exp: 0,
			inc: 0
		},
		budget: 0
	};

	return {
		addItemToData: function(type, des, value) {

			var ID, newItem;

			if (data.allItems[type].length > 0) {
				ID = data.allItems[type][data.allItems[type].length -1].id + 1;
			} else {
				ID = 0;
			}

			if (type === 'inc') {
				newItem = new Income(ID, des, value);
			} else if (type === 'exp') {
				newItem = new Expenses(ID, des, value)
			}

			data.allItems[type].push(newItem);

			return newItem;
		},

		calculateBudget: function() {
			calculateTotal('inc');
			calculateTotal('exp');
			data.budget = data.total.inc - data.total.exp;
			
		},

		getBudget: function() {
			return {
				totalInc: data.total.inc,
				totalExp: data.total.exp,
				balance: data.budget
			};
		},

		deleteItem: function(type, id) {
			var ids, index;

			ids = data.allItems[type].map(function(element){
				return element.id;
			});

			index = ids.indexOf(id);

			if (index !== -1) {
				data.allItems[type].splice(index,1);
			}
		},

		getItem: function(type, id) {
			var ids, index, element;
			//returns list of id in data
			ids = data.allItems[type].map(function(element){
				return element.id;
			});

			index = ids.indexOf(id);
			element = data.allItems[type][index];
			return element;

		},

		updateItem: function(type, index, id, des, value) {
			var item = data.allItems[type][index]
			item.id = id;
			item.description = des;
			item.value = value; 
		},

		test: function() {
			console.log(data);
		}
	}
})();

//************ UI Controller***************************************

var UIController = (function() {

	var DOMstrings = {
		inputType: '.choose_type',
		inputDescription: '.add_description',
		inputValue: '.add_value',
		inputButton: '.add_btn',
		updateButton: '.update_btn',
		incomeItem: '.income_item',
		expensesitem: '.expenses_item',
		transactionList: '.transaction',
		incomeLabel: '.budget_income_value',
		expensesLabel: '.budget_expenses_value',
		balanceLabel: '.budget_balance_value',
		transaction: '.transaction',
		deleteLabel: '.delete_item',
		deleteTransaction: '.delete_button'
	};

	var formatNumber = function(num, type=false) {
	//some code
	num = Math.abs(num);
	num = num.toFixed(2);
	numSplit = num.split('.');

	int = numSplit[0];
	dec = numSplit[1];


	if (int.length > 3 && int.length <= 6 ) {
		int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, int.length);
	}
	else if (int.length > 6) {
		int = int.substr(0,int.length-6) + ',' + int.substr(int.length-6, int.length - 4) + ',' + int.substr(int.length - 3, int.length);
	}
	

	if (type) {
		return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;
	} else {
		return int + '.' + dec;
	}
	
};

	return {
		getInput: function() {

			return {
				type: document.querySelector(DOMstrings.inputType).value,
				description: document.querySelector(DOMstrings.inputDescription).value,
				//convert string to a float to be used in calculation
				value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
			};
			
		},

		displayBalance: function(obj) {
			var type;
			obj.balance >= 0 ? type = 'inc' : type = 'exp';
			document.querySelector(DOMstrings.balanceLabel).textContent =  formatNumber(obj.balance, type);
			document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExp,'exp');
			document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc,'inc');

		},

		addListItem: function(obj, type) {

			var element, html, newHtml;
			element = DOMstrings.transactionList;
			if (type === 'inc') {
				//element = DOMstrings.transactionList;
				html = '<div class="transaction-row income_item" id="inc-%id%"><div class="transaction-cell desc">%description%</div><div class="transaction-cell outgoing"></div><div class="transaction-cell incoming">%value%</div><div class="transaction-cell edit_button"><div class="edit">Edit</div><div class="delete">Del</div></div></div>';
			} else if (type === 'exp') {
				//element = DOMstrings.transactionList;
				html = '<div class="transaction-row expenses_item" id="exp-%id%"><div class="transaction-cell desc">%description%</div><div class="transaction-cell outgoing">%value%</div><div class="transaction-cell incoming"></div><div class="transaction-cell edit_button"><div class="edit">Edit</div><div class="delete">Del</div></div></div>';
			}
			newHtml = html.replace('%id%', obj.id);
			newHtml = newHtml.replace('%description%', obj.description);
			newHtml = newHtml.replace('%value%', formatNumber(obj.value));
			document.querySelector(element).insertAdjacentHTML('beforeend',newHtml);
		},

		deleteListItem: function(selectorID) {
			var element = document.getElementById(selectorID);
			element.parentNode.removeChild(element);
		},

		clearField: function() {
			var field;
			// this returns a list
			fields = document.querySelectorAll(DOMstrings.inputDescription + ',' + DOMstrings.inputValue);
			// convert results of nodelist to array
			fieldArr = Array.prototype.slice.call(fields);

			fieldArr.forEach( function(element, index) {
				// statements
				element.value = "";
			});

			fieldArr[0].focus();
		},

		displayEditingItem: function(type, des, value) {
			document.querySelector(DOMstrings.inputType).value = type;
			document.querySelector(DOMstrings.inputDescription).value = des;
			document.querySelector(DOMstrings.inputValue).value = value;
		},

		getDOMstrings: function() {
			return DOMstrings;
		}
	};

})();


//**************** App Controller ***********************************************************************
//*******************************************************************************************************

var appController = (function(budgetCtrl, UICtrl) {
	
	var setupEventListenter = function() {
		var DOM = UICtrl.getDOMstrings();


			document.querySelector(DOM.inputButton).addEventListener('click', ctrlAddItem);

			document.addEventListener('keypress',function(event) {
				if (event.keycode === 13 || event.which === 13) {
					ctrlAddItem();
				}
			});
		

		//document.querySelector(DOM.transaction).addEventListener('click', ctrlEditItem);
		document.querySelector(DOM.transaction).addEventListener('click', function(event) {
			var name = event.target.className;
			if (name === 'delete') {
				ctrlDeleteItem(event);
			} else if (name === 'edit'){
				ctrlEditItem(event);
			}
			
		});
	};
	
	var updateBudget = function() {
		budgetCtrl.calculateBudget();
		var budget = budgetCtrl.getBudget();
		UICtrl.displayBalance(budget);

	}

	var ctrlAddItem = function() {

		var input, newItem;
		input = UICtrl.getInput();
		//console.log(input);

		if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
			newItem = budgetCtrl.addItemToData(input.type, input.description, input.value);
			UICtrl.addListItem(newItem,input.type);
			UICtrl.clearField();
			updateBudget();
		}	
		
	};

	var getElement = function(event) {
		var itemID, splitItem, type, ID;
		itemID = event.target.parentNode.parentNode.id;
		if (itemID) {
			splitItem = itemID.split('-');
			type = splitItem[0];
			ID = parseInt(splitItem[1]);
		}
		return {
			itemID: itemID,
			type: type,
			ID: ID
		};
	};

	var ctrlDeleteItem = function(event) {
		var item = getElement(event);
		var itemID = item.itemID;
		var type = item.type;
		var ID = item.ID;

		budgetCtrl.deleteItem(type,ID);
		UICtrl.deleteListItem(itemID);

		updateBudget();


		// var itemID, splitItem, type, ID;

		// itemID = event.target.parentNode.parentNode.id;
		// if (itemID) {

		// 	splitItem = itemID.split('-');
		// 	type = splitItem[0];
		// 	ID = parseInt(splitItem[1]);
		// 	budgetCtrl.deleteItem(type,ID);
		// 	UICtrl.deleteListItem(itemID);

		// 	updateBudget();
			
		// }
	};

	var ctrlEditItem = function(event) {
		var item = getElement(event);
		var itemID = item.itemID;
		var type = item.type;
		var ID = item.ID;

		var myItem = budgetCtrl.getItem(type,ID);

		UICtrl.displayEditingItem(type,myItem.description, myItem.value);
		ctrlDeleteItem(event);

	};

	return {
		
		init: function() {
			console.log('Application has started!');
			updateBudget();
			return setupEventListenter();
		}
	};
	
})(budgetController,UIController);

appController.init();