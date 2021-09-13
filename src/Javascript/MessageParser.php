<?php

namespace Proengsoft\JsValidation\Javascript;

use Proengsoft\JsValidation\JsValidatorFactory;
use Proengsoft\JsValidation\Support\DelegatedValidator;
use Proengsoft\JsValidation\Support\UseDelegatedValidatorTrait;
use Symfony\Component\HttpFoundation\File\UploadedFile;

class MessageParser
{
    use UseDelegatedValidatorTrait;

    /**
     * Whether to escape messages using htmlentities.
     *
     * @var bool
     */
    protected $escape;

    /**
     * Create a new JsValidation instance.
     *
     * @param  \Proengsoft\JsValidation\Support\DelegatedValidator  $validator
     * @param  bool  $escape
     */
    public function __construct(DelegatedValidator $validator, $escape = false)
    {
        $this->validator = $validator;
        $this->escape = $escape;
    }

    /**
     *  Replace javascript error message place-holders with actual values.
     *
     * @param  string  $attribute
     * @param  string  $rule
     * @param  array  $parameters
     * @return mixed
     */
    public function getMessage($attribute, $rule, $parameters)
    {
        $attribute = str_replace(JsValidatorFactory::ASTERISK, '*', $attribute);

        $data = $this->fakeValidationData($attribute, $rule, $parameters);

        $message = $this->validator->getMessage($attribute, $rule);
        $message = $this->validator->makeReplacements($message, $attribute, $rule, $parameters);

        $this->validator->setData($data);

        return $this->escape ? e($message) : $message;
    }

    /**
     * Creates fake data needed to parse messages
     * Returns original data.
     *
     * @param  string  $attribute
     * @param  string  $rule
     * @param $parameters
     * @return array
     */
    protected function fakeValidationData($attribute, $rule, $parameters)
    {
        $data = $this->validator->getData();

        $this->fakeFileData($data, $attribute);
        $this->fakeRequiredIfData($data, $rule, $parameters);

        return $data;
    }

    /**
     * Generate fake data to get RequiredIf message.
     *
     * @param $data
     * @param $rule
     * @param $parameters
     * @return void
     */
    private function fakeRequiredIfData($data, $rule, $parameters)
    {
        if ($rule !== 'RequiredIf') {
            return;
        }

        $newData = $data;
        $newData[$parameters[0]] = $parameters[1];
        $this->validator->setData($newData);
    }

    /**
     * Generate fake data to get file type messages.
     *
     * @param $data
     * @param $attribute
     * @return void
     */
    private function fakeFileData($data, $attribute)
    {
        if (! $this->validator->hasRule($attribute, ['Mimes', 'Image'])) {
            return;
        }

        $newFiles = $data;
        $newFiles[$attribute] = $this->createUploadedFile();
        $this->validator->setData($newFiles);
    }

    /**
     * Create fake UploadedFile to generate file messages.
     *
     * @return UploadedFile
     */
    protected function createUploadedFile()
    {
        return new UploadedFile('fakefile', 'fakefile', null, UPLOAD_ERR_NO_FILE, true);
    }
}
