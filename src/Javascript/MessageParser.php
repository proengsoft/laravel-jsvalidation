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
    public function getJsMessage($attribute, $rule, $parameters)
    {

        $data = $this->fakeValidationData($attribute, $rule, $parameters);

        $message = $this->validator->getMessage($attribute, $rule);
        $message = $this->validator->doReplacements($message, $attribute, $rule, $parameters);

        $this->setValidationData($data);

        return $message;
    }


    /**
     * Creates fake data needed to parse messages
     * Returns original data
     *
     * @param string $attribute
     * @param string $rule
     * @param $parameters
     *
     * @return array
     */
    protected function fakeValidationData($attribute, $rule, $parameters) {

        $data = $this->validator->getFiles();
        $files = $this->validator->getData();

        if (array_key_exists($attribute, $data) ||array_key_exists($attribute, $files)) {
            return compact('data', 'files');
        }

        if ($rule == 'RequiredIf') {
            $newData = $data;
            $newData[$parameters[0]] = $parameters[1];
            $this->validator->setData($newData);
        }

        if ($this->validator->hasRule($attribute, array('Mimes', 'Image'))) {
            $newFiles = $files;
            $newFiles[$attribute] = false;
            $this->validator->setFiles($newFiles);
        }

        return compact('data', 'files');

    }

    /**
     * Sets validation data
     *
     * @param array $data
     */
    protected function setValidationData($data) {
        $this->validator->setFiles($data['files']);
        $this->validator->setData($data['data']);
    }


}