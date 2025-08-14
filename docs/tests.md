# Tests

Tests in Derw follow three simple steps:

-   Import `Test` from stdlib
-   Write a function `testAnExample: boolean? -> void`
-   Write the function body using `Test.equals` or `Test.notEquals`
-   The file should be named `SomeName_test.derw`

You can then run `derw test` from inside your project to run all tests. There no need to manually expose tests as Derw will do it for you.

You can run specific tests via `derw test --file SomeName_test.derw --function testAnExample`.

To see examples of tests, check out the [stdlib examples](https://github.com/derw-lang/stdlib/tree/main/src).

Under the hood, [Bach](https://github.com/eeue56/bach) is used for running tests.
