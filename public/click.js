angular.module('buttons',[])
  .controller('buttonCtrl',ButtonCtrl)
  .factory('buttonApi',buttonApi)
  .constant('apiUrl','http://localhost:1337'); // CHANGED for the lab 2017!

function ButtonCtrl($scope,buttonApi){
   $scope.buttons=[]; //Initially all was still
   $scope.transactionItems=[];
   $scope.errorMessage='';
   $scope.refreshButtons=refreshButtons;
   $scope.buttonClick=buttonClick;
   $scope.deleteItem=deleteItem;
   $scope.listTransaction=listTransaction;
   $scope.voidTransaction=voidTransaction;
   $scope.completeTransaction=completeTransaction;
   $scope.totalPrice=0;

  function refreshButtons(){
    $scope.errorMessage='';
    buttonApi.getButtons()
      .success(function(data){
         $scope.buttons=data;
      })
      .error(function () {
         $scope.errorMessage="Unable to load Buttons:  Database request failed";
      });
  }
  function buttonClick($event){
    console.log("Button clicked" + $event.target.id);
    console.log($event);
    $scope.errorMessage='';
    if($event.target.id == 11) {
      completeTransaction();
    } else if($event.target.id == 12) {
      voidTransaction();
    } else {
      buttonApi.clickButton($event.target.id)
        .success(function(transactionItems){
          console.log(transactionItems);
	        $scope.transactionItems = transactionItems;
	        refreshButtons();
          listTransaction();
          console.log("Button click successful");
          console.log($scope.transactionItems);
	})
        .error(function(){
	  $scope.errorMessage="Unable to add item -> id:" + $event.target.id;
	});
      }
  }
  function getUser(){} // Need to implement
  function changeUser(){} // Need to implement
  // Creates a new stored table for the completed transaction with the current transaction list,
  // drop all items from the current transaction table, reset the transaction list and total.
  // Then, re-load the empty current transaction table.
  function completeTransaction(){
    $scope.errorMessage='';
    buttonApi.completeTransaction()
      .success(function(data){
        $scope.totalPrice=0;
        $scope.transactionItems=[];
        refreshButtons();
        listTransaction();
      })
      .error(function(){
        $scope.errorMessage="Failed to complete transaction";
      });
  }

  function listTransaction(){ // Return a JSON of the current transaction table - includes item, quantity, price, total
    $scope.errorMessage='';
    console.log("in listTransaction()");
    buttonApi.listTransaction()
      .success(function(data){
        $scope.transactionItems=data;
        $scope.totalPrice=0;
        data = data.map(function(item){
          $scope.totalPrice += item.total;
          return item;
        })
        $scope.totalPrice = parseFloat($scope.totalPrice).toFixed(2);
      })
      .error(function(){
        $scope.errorMessage="Failed to list transaction";
      });
  }

  function deleteItem($event){
    console.log("in deleteItem()");
    console.log($event.target.id);
    $scope.errorMessage='';
    buttonApi.deleteItem($event.target.id)
    .success(function(data){
    listTransaction();
  })
    .error(function(){$scope.errorMessage="Unable click";});
  }

  function voidTransaction(){
    $scope.errorMessage='';
    buttonApi.voidTransaction()
      .success(function(data){
        $scope.totalPrice=0;
	      $scope.transactionItems=[];
	      refreshButtons();
	      listTransaction();
      })
      .error(function(){
        $scope.errorMessage="Failed to void transaction";
      });
  }
  listTransaction();  //load the JSON of the current transaction table
  refreshButtons();  //load the JSON of the till buttons
}

function buttonApi($http,apiUrl){
  return{
    getButtons: function(){
      var url = apiUrl + '/buttons';
      return $http.get(url);
    },
    clickButton: function(id){id
      var url = apiUrl+'/click?id='+id;
      return $http.post(url); // Easy enough to do this way
    },
    getUser: function(){
      var url = apiUrl + '/currentUser';
      return $http.get(url);
    },
    changeUser: function(id){ //need to add id to credentials.json to log in as different user
      var url = apiUrl + '/changeUser?id='+id;
      return $http.get(url);
    },
    completeTransaction: function(){
      var url = apiUrl + '/sale';
      return $http.get(url);
    },
    voidTransaction: function(){
      var url = apiUrl + '/void';
      return $http.get(url);
    },
    listTransaction: function(){
      var url = apiUrl + '/list';
      return $http.get(url);
    },
    deleteItem: function(id){
      var url = apiUrl + '/deleteItem?id='+id;
      return $http.get(url);
    }
 };
}
