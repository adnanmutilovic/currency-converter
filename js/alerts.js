
function getCookie(cname) {
    let name = cname + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
    for(let i = 0; i <ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) == ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
      }
    }
    return "";
  }

  const userData = JSON.parse(getCookie('crud-user'));

  const fetchUser = async ()=>{
    const data = await fetch('http://localhost/currency-converter/api/verify-jwt',{
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        token: userData?.token
      })
    })
    return data;
  }

  fetchUser().then(res=>res.json()).then(data=>{
    console.log(data);
  }).catch(error=>{
    console.error('Error:', error);
  })


  //TODO:: show ALERT information
  const showAlertsCurrencies = () => {
    fetchUser().then(res=>res.json()).then(data=>{
      var xhr = new XMLHttpRequest();
      xhr.open('GET', `http://localhost/currency-converter/api/alerts/alerts/all/${data?.email}`, true);
      var results = [];
      document.getElementById('tableBody').innerHTML = `
      <tr>
        <td colspan="7" class="text-center">
          <div class="spinner-border" role="status">
            <span class="visually-hidden"></span>
          </div>
        </td>
      </tr>
      `;

      xhr.onload = function () {
        if (this.status == 200) {
          currencies = JSON.parse(this.responseText);
          var tableRows = '';

          currencies.forEach(function (currency) {

            tableRows += `
            <tr class="text-black-100 text-xl">
              <td class="border border-slate">${currency.id}</td>
              <td class="border border-slate">${currency.fromCurrency}</td>
              <td class="border border-slate">${currency.toCurrency}</td>
              <td class="border border-slate">${currency.value}</td>
              <td>
                <button class='btn btn-danger btn-sm' onclick='deleteAlertsCurrencies(${currency.id})' id="deleteBtn">Delete</button>
              </td>
              <td>
                <button onclick='editAlertsCurrencies(${currency.id})' class='btn btn-primary btn-sm'>Edit</button>
              </td>
            </tr>

            `;
          });

          document.getElementById('tableBody').innerHTML = tableRows;
        }
      };

      xhr.send();
    
    }).catch(error=>{
      console.error('Error:', error);
    })
    
  };
  //TODO:: Call the showAlertsCurrencies function to fetch and display the user data
  showAlertsCurrencies();




  const submitForm = document.getElementById("submitForm");
  submitForm.addEventListener("submit", function(event){
    event.preventDefault();
    // console.log("submit");

    const fromCurrency =  event.target.fromCurrency.value;
    const toCurrency =  event.target.toCurrency.value;
    const value = event.target.amount.value;

    fetchUser().then(res=>res.json()).then(data=>{
      // Create an object to hold the form data
      const formData = {
        fromCurrency: fromCurrency,
        toCurrency: toCurrency,
        value: value,
        email: data?.email
      };

    // Create a new XMLHttpRequest object
      const xhr = new XMLHttpRequest();

    // Set the request URL and method
      xhr.open("POST", "http://localhost/currency-converter/api/alerts/alerts/", true);

    // Set the request header
      xhr.setRequestHeader("Content-Type", "application/json");

    // Define the callback function to handle the response
      xhr.onload = function() {
        if (xhr.status >= 200 && xhr.status < 400) {
          // Request was successful
          const response = JSON.parse(xhr.responseText);
          console.log(response);
          // Handle the response data
          // alert("Favorite currency created successfully");
          document.getElementById("successMessage").classList.remove("d-none");
          document.getElementById("errorMessage").classList.add("d-none");
          showAlertsCurrencies();
          submitForm.reset();
        } else {
            // Request was unsuccessful
            console.error("Error:", xhr.response);
            const errorResponse = JSON.parse(xhr.response);
            console.log(errorResponse);
            document.getElementById("errorMessage").classList.remove("d-none");
            document.getElementById("successMessage").classList.add("d-none");
            document.getElementById("errorMessage").innerText = errorResponse?.message;
        }
      };

    // Define the callback function to handle any error
      xhr.onerror = function() {
        console.error("Error:", xhr.statusText);
        document.getElementById("errorMessage").classList.remove("d-none");
        document.getElementById("successMessage").classList.add("d-none");
      };

      // Convert the form data to JSON string
      const jsonData = JSON.stringify(formData);

      // Send the request with the JSON data
      xhr.send(jsonData);
    }).catch(error=>{
      console.error('Error:', error);
    })   

  });


const deleteAlertsCurrencies = (currencyId)=>{
  const id = parseInt(currencyId);
  // console.log(id);

  const flag = window.confirm('Are you sure you want to delete it?');
  // console.log(flag);
  if(!flag){
    return;
  }
  var xhr = new XMLHttpRequest();
  xhr.open('DELETE', `http://localhost/currency-converter/api/alerts/alerts/${id}`, true);
  xhr.onload = function () {
    if (this.status == 200) {
      const response = JSON.parse(xhr.responseText);
      console.log(response);
      document.getElementById("successMessage").classList.remove("d-none");
      document.getElementById("errorMessage").classList.add("d-none");
      document.getElementById("successMessage").innerText = response?.message;
      showAlertsCurrencies();
    }
  };
  xhr.send();
}


const editAlertsCurrencies = (currencyId)=>{
  const id = parseInt(currencyId);

  // Get the result data for the specified resultId
  var xhr = new XMLHttpRequest();
  console.log(id);
  xhr.open('GET', `http://localhost/currency-converter/api/alerts/alerts/${id}`, true);

  xhr.onload = function() {
    if (this.status == 200) {
      var currency = JSON.parse(this.responseText);
      var currencyId = currency.id;
      var fromCurrency = currency.fromCurrency;
      var toCurrency = currency.toCurrency;
      var value = currency.value

      // Set the form values in the update result modal
      document.getElementById("updateCurrencyId").value = currencyId;
      document.getElementById('fromCurrency').value = fromCurrency;
      document.getElementById('toCurrency').value = toCurrency;
      document.getElementById('amount').value = value;

      // Open the update result modal
      var modal = new bootstrap.Modal(document.getElementById('updateFavoriteCurrencyModal'));
      modal.show();
    }
  };
  xhr.send();

}

const updateCurrencyForm = document.getElementById("updateCurrencyForm");
updateCurrencyForm.addEventListener("submit", function(event){
  event.preventDefault();
  console.log("submit");


  // Get the updated values from the input fields
  let currencyId = document.getElementById('updateCurrencyId').value;
  const fromCurrency = document.getElementById('fromCurrency').value;
  const toCurrency = document.getElementById('toCurrency').value;
  const value = parseInt(document.getElementById('amount').value);

  currencyId = parseInt(currencyId);

  // Create an object with the updated result data
  const updatedCurrencyData = {
    fromCurrency: fromCurrency,
    toCurrency: toCurrency,
    value: value
  };

   // Create a new XMLHttpRequest object
  var xhr = new XMLHttpRequest();
  
  // Set the request method and URL
  xhr.open('PUT', 'http://localhost/currency-converter/api/alerts/alerts/' + currencyId, true);

  // Set the request header
  xhr.setRequestHeader('Content-Type', 'application/json');
  
  // Define the callback function for when the request is complete
  xhr.onload = function() {
    if (xhr.status === 200) {
       // Request was successful, handle the response
      const response = JSON.parse(xhr.responseText);
      console.log(response);
      document.getElementById("successMessage").classList.remove("d-none");
      document.getElementById("errorMessage").classList.add("d-none");
      document.getElementById("successMessage").innerText = response?.message;
      showAlertsCurrencies();
    } else {
      // Request failed, handle the error
      console.error('Error:', xhr.status);
    }
  };

  // Convert the updated result data to JSON string
  const jsonData = JSON.stringify(updatedCurrencyData);

  // Send the request with the JSON data
  xhr.send(jsonData);

  const updateFavoriteCurrencyModal = new bootstrap.Modal(document.getElementById('updateFavoriteCurrencyModal'));
  updateFavoriteCurrencyModal.hide();

  // Reset the form
  updateCurrencyForm.reset();
})

