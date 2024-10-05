$(document).ready(function () {
    $('.pay-form').submit(function (e) {
        e.preventDefault();

        var formData = $(this).serialize();

        $.ajax({
            url: "/createOrder",
            type: "POST",
            data: formData,
            success: function (res) {
                if (res.success) {
                    var options = {
                        "key": "" + res.key_id + "",
                        "amount": "" + res.amount + "",
                        "currency": "INR",
                        "name": "" + res.product_name + "",
                        "description": "" + res.description + "",
                        "image": "img/web yoga icon.png",
                        "order_id": "" + res.order_id + "",
                        "handler": function (response) {
                            // Redirect to the success page with the necessary data
                            window.location.href = `/success?name=${res.name}&email=${res.email}&contact=${res.contact}&planAmount=${res.amount}&plan=${res.description}`;
                            alert("Payment Succeeded");
                        },
                        "prefill": {
                            "contact": "" + res.contact + "",
                            "name": "" + res.name + "",
                            "email": "" + res.email + ""
                        },
                        "notes": {
                            "description": "" + res.description + ""
                        },
                        "theme": {
                            "color": "#2300a3"
                        }
                    };
                    var razorpayObject = new Razorpay(options);
                    razorpayObject.on('payment.failed', function (response) {
                        alert("Payment Failed");
                    });
                    razorpayObject.open();
                } else {
                    alert(res.msg);
                }
            }
        });
    });
});
