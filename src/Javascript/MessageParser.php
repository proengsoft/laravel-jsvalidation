<?php

namespace Proengsoft\JsValidation\Javascript;

use Proengsoft\JsValidation\Support\DelegatedValidator;
use Proengsoft\JsValidation\Support\UseDelegatedValidatorTrait;

class MessageParser
{
    use UseDelegatedValidatorTrait;

    /**
     * Create a new JsValidation instance.
     *
     * @param \Proengsoft\JsValidation\Support\DelegatedValidator $validator
     */
    public function __construct(DelegatedValidator $validator)
    {
        $this->validator = $validator;
    }

    /**
     *  Replace javascript error message place-holders with actual values.
     *
     * @param string $attribute
     * @param string $rule
     * @param array  $parameters
     *
     * @return mixed
     */
    public function getMessage($attribute, $rule, $parameters)
    {
        $data = $this->fakeValidationData($attribute, $rule, $parameters);

        $message = $this->validator->getMessage($attribute, $rule);
        $message = $this->validator->doReplacements($message, $attribute, $rule, $parameters);

        $this->setValidationData($data);

        return $message;
    }

    /**
     * Creates fake data needed to parse messages
     * Returns original data.
     *
     * @param string $attribute
     * @param string $rule
     * @param $parameters
     *
     * @return array
     */
    protected function fakeValidationData($attribute, $rule, $parameters)
    {
        $files = $this->validator->getFiles();
        $data = $this->validator->getData();

        $this->fakeFileData($files, $attribute);
        $this->fakeRequiredIfData($data, $rule, $parameters);

        return compact('data', 'files');
    }

    /**
     * Generate fake data to get RequiredIf message.
     *
     * @param $data
     * @param $rule
     * @param $parameters
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
     * @param $files
     * @param $attribute
     */
    private function fakeFileData($files, $attribute)
    {
        if (! $this->validator->hasRule($attribute, array('Mimes', 'Image'))) {
            return;
        }

        $newFiles = $files;
        $newFiles[$attribute] = false;
        $this->validator->setFiles($newFiles);
    }

    /**
     * Sets validation data.
     *
     * @param array $data
     */
    protected function setValidationData($data)
    {
        $this->validator->setFiles($data['files']);
        $this->validator->setData($data['data']);
    }
}
