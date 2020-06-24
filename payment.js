var stripe = Stripe("pk_test_r7XtqMfzl0rITTrvFCNlswtQ00ipmL3xhq");
//var stripe = Stripe("pk_live_Ly4UYRqSQrSyDbq3sUUGgxU200RbJFyQ2W");
var elements = stripe.elements();
const paybutton = document.getElementById("paybutton");
var defaultlabel;

var style = {
  base: {
    iconColor: "#666EE8",
    color: "#31325F",
    lineHeight: "40px",
    fontWeight: 300,
    fontFamily: "Helvetica Neue",
    fontSize: "15px",

    "::placeholder": {
      color: "#CFD7E0"
    }
  }
};

var cardNumberElement = elements.create("cardNumber", {
  style: style,
  placeholder: "Card number"
});
cardNumberElement.mount("#card-number-element");

var cardExpiryElement = elements.create("cardExpiry", {
  style: style,
  placeholder: "Expiry date"
});
cardExpiryElement.mount("#card-expiry-element");

var cardCvcElement = elements.create("cardCvc", {
  style: style,
  placeholder: "CVC"
});
cardCvcElement.mount("#card-cvc-element");

function setOutcome(result) {
  var successElement = document.querySelector(".success");
  var errorElement = document.querySelector(".error");
  successElement.classList.remove("visible");
  errorElement.classList.remove("visible");
  console.log(defaultlabel)

  if (result.token) {
    const user_data = sessionStorage.getItem("user");
    const { email, firstname, lastname, address } = JSON.parse(user_data);
    const amount = sessionStorage.getItem("amount");
    const url = sessionStorage.getItem("frequency") == 1 ? `http://localhost:3000/api/charges` : `http://localhost:3000/api/charge`;
    fetch(url, {
      method: "POST",
      headers: new Headers({
        "Content-Type": "application/json; charset=UTF-8"
      }),
      body: JSON.stringify({
        token: result.token.id,
        amount: amount * 100,
        description: "donation",
        email,
        firstname,
        lastname,
        address
      })
    })
      .then(res => res.json())
      .then(data => {
        const { status } = data;
        if (status === "error") {
          paybutton.innerHTML = defaultlabel;
          paybutton.removeAttribute("disabled");
          errorElement.textContent = data.message;
          errorElement.classList.add("visible");
        } else {
          paybutton.innerHTML = "Success!";
          successElement.classList.add("visible");
        }
      })
      .catch(err => console.log(err));
    //successElement.querySelector(".token").textContent = result.token.id;
    //successElement.classList.add("visible");

    // In a real integration, you'd submit the form with the token to your backend server
    //var form = document.querySelector('form');
    //form.querySelector('input[name="token"]').setAttribute('value', result.token.id);
    //form.submit();
  } else if (result.error) {
    paybutton.innerHTML = defaultlabel;
    paybutton.removeAttribute("disabled");
    errorElement.textContent = result.error.message;
    errorElement.classList.add("visible");
  }
}

cardNumberElement.on("change", function (event) {
  defaultlabel = paybutton.innerHTML;
  setOutcome(event);
});

document.querySelector("form").addEventListener("submit", function (e) {
  e.preventDefault();
  paybutton.setAttribute("disabled", "disabled");
  defaultlabel = paybutton.innerHTML;
  paybutton.innerHTML = "Paying...";
  
  stripe.createToken(cardNumberElement).then(f=>setOutcome(f));
});
