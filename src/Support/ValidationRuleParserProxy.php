<?php

namespace Proengsoft\JsValidation\Support;

use Illuminate\Validation\ValidationRuleParser;

class ValidationRuleParserProxy
{
    /**
     * Extract the rule name and parameters from a rule.
     *
     * @param  array|string  $rules
     * @return array
     */
    public function parse($rules)
    {
        return ValidationRuleParser::parse($rules);
    }
}
