if(userId){
  $('.userField').val(userId);
}

$('.add-contact').on('click', function(){
  console.log('clicked');
  setTimeout(function(){ $("#contactName").focus(); }, 500);
});

for(i=0; i < contacts.length ; i++) {
  console.log('contacts = ' + contacts);
  console.log('here is the contact name: ' + contacts[i].name);
  var div = $('<div class="card" style="width: 20rem;"><div class="card-body"><h4 class="card-title">'+contacts[i].name+'</h4><p class="card-text">Phone number: '+contacts[i].number+'</p><a value="'+contacts[i].id+'" name_value="'+contacts[i].name+'" number_value="'+contacts[i].number+'" href="#" class="edit-link" data-toggle="modal" data-target="#editContactModal">Edit</a><a href="#" class="delete-link" data-toggle="modal" value="'+contacts[i].id+'" data-target="#deleteModal">Delete</a></div>');
  console.log('here is the contact id: ' + contacts[i].id);
  console.log(div);
  $("#contacts-list").append(div);
};

$('.delete-link').on('click', function(){
  var deleteId = $(this).attr("value");
  console.log(deleteId);
  $('#deleteField').val(deleteId);
});

$('.edit-link').on('click', function(){
  var currentName = $(this).attr("name_value");
  var currentNumber = $(this).attr("number_value");
  var contactId = $(this).attr("value");
  $('#editContactName').val(currentName);
  $('#editContactNumber').val(currentNumber);
  $('#idField').val(contactId);
});

document.getElementById('Logout').onclick = function() {
  amazon.Login.logout();
};
