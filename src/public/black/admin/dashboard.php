<?php
    require_once("sessionManager.php");
    require_once("pixManager.php");

    Session::startSession();

    if (!Session::isLoggedIn()) {
        header("Location: index.php");
        exit();
    }

    if ($_SERVER["REQUEST_METHOD"] == "POST") {
        if (isset($_POST["newPix"])) {
            PixKey::save($_POST["newPix"]);
            header("Location: dashboard.php");
            exit();
        }
    }
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-EVSTQN3/azprG1Anm3QDgpJLIm9Nao0Yz1ztcQTwFspd3yD65VohhpuuCOmLASjC" crossorigin="anonymous">
    <style>
        body {
            background-color: #f8f9fa;
        }

        .dashboard {
            margin-top: 100px;
            padding: 20px;
        }

        .dashboard h1 {
            color: #333;
            font-size: 28px;
            margin-bottom: 20px;
        }

        .form-floating label {
            color: #666;
        }

        .btn-primary {
            background-color: #007bff;
            border-color: #007bff;
        }
        
        .btn-primary:hover {
            background-color: #0056b3;
            border-color: #0056b3;
        }

        .alert-primary {
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
        }
    </style>
</head>
<body>
<div class="container">
    <div class="row justify-content-center">
        <div class="col-md-4">
            <div class="dashboard p-4">
                <h1 class="text-center">Configurações</h1>
                <div class="mb-3">
                    <label for="currentPix" class="form-label">Chave PIX atual</label>
                    <div class="alert alert-primary" role="alert" id="currentPix"><?php echo PixKey::load();?></div>
                </div>
                <form action="dashboard.php" method="post">
                    <div class="mb-3">
                        <label for="newPixKey" class="form-label">Nova chave PIX</label>
                        <input type="text" class="form-control" id="newPix" name="newPix" placeholder="Digite a nova chave PIX" autocomplete="off">
                    </div>
                    <div class="d-grid">
                        <button class="btn btn-primary" type="submit">Alterar</button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</div>
</body>
</html>