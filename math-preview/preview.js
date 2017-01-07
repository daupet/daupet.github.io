$(function()
{
    function makePreview()
    {
        input = $('#input').val();
        input = input.replace(/</g, "&lt;");
        input = input.replace(/>/g, "&gt;");

        $('#preview').html(input);
        MathJax.Hub.Queue(["Typeset", MathJax.Hub, "preview"]);
    }

    $('#input').keyup(function(){makePreview()});
    $('#input').bind('updated', function(){ makePreview(); });

    makePreview();
});
