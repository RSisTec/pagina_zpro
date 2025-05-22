<?php
/**
 * Arquivo de configuração da API
 * 
 * Este arquivo contém as configurações gerais da API
 */

return [
    // Configurações gerais
    'app_name' => 'Estacionamento API',
    'version' => '1.0.0',
    'debug' => true,
    
    // Configurações de autenticação
    'auth' => [
        'jwt_secret' => 'estacionamento_secret_key_2025',
        'token_expiration' => 86400, // 24 horas em segundos
        'refresh_token_expiration' => 604800 // 7 dias em segundos
    ],
    
    // Configurações de CORS
    'cors' => [
        'allowed_origins' => ['*'],
        'allowed_methods' => ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        'allowed_headers' => ['Content-Type', 'Authorization', 'X-Requested-With']
    ],
    
    // Configurações de log
    'log' => [
        'enabled' => true,
        'path' => __DIR__ . '/../logs',
        'level' => 'debug' // debug, info, warning, error
    ],
    
    // Configurações de upload
    'upload' => [
        'path' => __DIR__ . '/../uploads',
        'allowed_types' => ['image/jpeg', 'image/png', 'image/gif'],
        'max_size' => 5242880 // 5MB em bytes
    ]
];
