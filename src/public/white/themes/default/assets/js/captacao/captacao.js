
(function($) {
    var $wrapper = $('.oc-button__wrapper'),
        $inputs = $('.oc-button__form-inputs'),
        $response = $('.oc-button__form-response'),
        $name = $('.oc--name'),
        $phone = $('.oc--phone'),
        $biller_id = $('.oc--biller_id'),
        $programacao_id = $('.oc--programacao_id'),
        $product_id = $('.oc--product_id'),
        $base_url = $('.oc--base_url'),
        $department_id = $('.oc--department_id'),
        $tel_biller = $('.oc--tel_biller'),
        $text_chat = $('.oc--text_chat'),
        $msgPhone = $('.oc-button__form-response span'),
        isOpen = false;

    // Toggle Button
    function toggleButton() {
        isOpen = !isOpen;
        $wrapper.toggleClass('oc-button--open');

        if (isOpen) {
         //$name.focus();
        }
    }

    // Form submit
    function submitForm(values) {

        var number = values.phoneNumber.substring(0, 2) + ' ' + values.phoneNumber.substring(2);

        $msgPhone.html(number);

        var data = {
            source: 'WHATSAPP',
            name: values.name,
            phoneNumber: values.phoneNumber,
            biller_id: values.biller_id,
            programacao_id: values.programacao_id,
            product_id: values.product_id,
            department_id: values.department_id,
            urlSite: window.location.href,
        };

        $inputs.fadeOut('600', function() {
            $response.html("<p>" + "Enviando sua solicitação, por favor aguarde..." + "<p");
            $response.fadeIn('600', function() {
                $.ajax({
                    url: values.base_url+'apputil/createLead',
                    type: 'GET',
                    headers: {
                        'Content-Type': 'text/plain; charset=utf-8'
                    },
                    data: data,
                }).done(function(answer) {
                    $response.fadeOut('600', function() {
                        if (answer.success) {
                            if (answer.open_whatsapp) {
                                var text = 'Olá, sou *'+  values.name + '*.%0A'+values.text_chat+'%0A*Página de Origem:* ' + window.location.href;

                                if (answer.telefone !== '') {
                                    window.open('https://api.whatsapp.com/send?phone=55' + answer.telefone + '&text=' + text, '_blank');
                                } else {
                                    window.open('https://api.whatsapp.com/send?phone=55' + values.tel_biller + '&text=' + text, '_blank');
                                }

                            }

                            $response.html("<p>" +  answer.result  + "<p");
                            $response.fadeIn('1000');
                        } else {
                            console.error('SagChat Button Error: ' + answer.error);
                            $response.html("<p> Ops... Houve um erro ao enviar sua solicitação:<p><br/>" +answer.error);
                            $response.fadeIn('1000');
                        }

                    });
                }).fail(function(error) {
                    $response.fadeOut('600', function() {
                        console.error('SagChat Button Error: ' + JSON.stringify(error));
                        $response.html("<p> Ops... Houve um erro ao enviar sua solicitação, por favor tente mais tarde.<p>");
                        $response.fadeIn('600');
                    });

                }).always(function() {
                    setTimeout(toggleButton, 8000);
                    setTimeout(function() {
                        $inputs.fadeIn('600');
                        $response.fadeOut('600');
                    }, 8400);
                });
            });
        });
    }

    // Input Mask
    $phone.keyup(function (event) {
        mascaraTelefone( this, mtel );
    });

    // Open Button
    $(document).on('click', '.oc-button__header', function() {
        toggleButton();
    });

    // Submit
    $(document).on('click', '.oc-button__button', function(e) {
        e.preventDefault();

        var name = $name.val(),
            biller_id = $biller_id.val(),
            programacao_id = $programacao_id.val(),
            product_id = $product_id.val(),
            department_id = $department_id.val(),
            base_url = $base_url.val(),
            text_chat = $text_chat.val(),
            tel_biller = $tel_biller.val(),
            phoneNumber = $phone.val();

        if (name.length > 0) {
            $name.removeClass('oc--error');
        } else {
            $name.addClass('oc--error');
        }

        if (phoneNumber.length >= 10) {
            $phone.removeClass('oc--error');
        } else {
            $phone.addClass('oc--error');
        }

        if (name.length > 0 && phoneNumber.length >= 10) {
            submitForm({
                name: name,
                phoneNumber: phoneNumber,
                biller_id: biller_id,
                programacao_id: programacao_id,
                product_id: product_id,
                department_id: department_id,
                text_chat: text_chat,
                tel_biller: tel_biller,
                base_url: base_url,
            });
        }
    });
})(jQuery);