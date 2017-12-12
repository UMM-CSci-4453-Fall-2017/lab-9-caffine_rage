angular.module('buttons',[])
  .controller('buttonCtrl',ButtonCtrl)
  .factory('buttonApi',buttonApi)
  .constant('apiUrl','http://localhost:1337'); // CHANGED for the lab 2017!

function ButtonCtrl($scope,$window,buttonApi){
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
   $scope.currentUser = null;
   $scope.login = login;
   $scope.reload = reload;

   function reload() {
     console.log("Trying to log out");
      $window.location.reload();
   }

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

  function login(user,pass){
    //console.log("Trying to log in");
    buttonApi.login(user, pass).success(function(res){
      if(res.correct){
        $scope.currentUser = user;
        refreshButtons();
      }
    });
  }

  function buttonClick($event){
    id = $event.target.id;
    user = $scope.currentUser;
    $scope.errorMessage='';
    if($event.target.id == 11) {
      completeTransaction();
    } else if($event.target.id == 12) {
      voidTransaction();
    } else {
      buttonApi.clickButton(id, user)
        .success(function(transactionItems){
          console.log($scope.currentUser);
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

  function completeTransaction(){
    user = $scope.currentUser;
    totalPrice = $scope.totalPrice;
    $scope.errorMessage='';
    buttonApi.completeTransaction(user, totalPrice)
    .success(function(){
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
    console.log("in listTransaction");
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
        $scope.errorMessage="Failedid to void transaction";
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
    clickButton: function(id, user){
      var url = apiUrl+'/click?id='+id+ '&user=' +user;
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
    completeTransaction: function(user, total){
      var url = apiUrl + '/sale?user='+user+ '&total='+total;
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
    },
    login: function(user, pass){
      var url = apiUrl + '/login/' + user + '/' + pass;
      console.log(url);
      return $http.get(url);
    }
 };
}
