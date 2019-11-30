var stripe = Stripe("pk_test_6pRNASCoBOKtIshFeQd4XMUh");
var elements = stripe.elements();

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
  placeholder: "Custom card number placeholder"
});
cardNumberElement.mount("#card-number-element");

var cardExpiryElement = elements.create("cardExpiry", {
  style: style,
  placeholder: "Custom expiry date placeholder"
});
cardExpiryElement.mount("#card-expiry-element");

var cardCvcElement = elements.create("cardCvc", {
  style: style,
  placeholder: "Custom CVC placeholder"
});
cardCvcElement.mount("#card-cvc-element");

function setOutcome(result) {
  var successElement = document.querySelector(".success");
  var errorElement = document.querySelector(".error");
  successElement.classList.remove("visible");
  errorElement.classList.remove("visible");
  console.log(result);
  if (result.token) {
    // In this example, we're simply displaying the token
    const user_data = sessionStorage.getItem("user");
    const { email } = user_data;
    const amount = sessionStorage.getItem("amount");
    fetch("http://517a7569.ngrok.io/charge", {
      method: "POST",
      headers: new Headers({
        "Content-Type": "application/json"
      }),
      body: JSON.stringify({
        token: result.token.id,
        amount: amount,
        description: "donation",
        email
      })
    })
      .then(res => res.json())
      .then(data => {
        const { status } = data;
        status === "error"
          ? this.setState({
              isProcessing: false,
              paymentStatus: "Your payment failed. Please try again"
            })
          : this.setState({
              isProcessing: false,
              paymentStatus: "Your payment has been completed successfully",
              done: true
            });
      })
      .catch(err => console.log(err));
    //successElement.querySelector(".token").textContent = result.token.id;
    //successElement.classList.add("visible");

    // In a real integration, you'd submit the form with the token to your backend server
    //var form = document.querySelector('form');
    //form.querySelector('input[name="token"]').setAttribute('value', result.token.id);
    //form.submit();
  } else if (result.error) {
    errorElement.textContent = result.error.message;
    errorElement.classList.add("visible");
  }
}

cardNumberElement.on("change", function(event) {
  setOutcome(event);
});

document.querySelector("form").addEventListener("submit", function(e) {
  e.preventDefault();

  /*let options = {
    email,
    firstname,
    lastname,
    address,
    phone
  };
  //stripe.createToken(cardNumberElement, options).then(setOutcome);*/
  stripe.createToken(cardNumberElement).then(setOutcome);
});